const {expect, use} = require('chai');

const { accounts, contract, web3 } = require('@openzeppelin/test-environment');

const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const {fromArtifact} = require('./test-helpers.js');

const ERC20 = contract.fromArtifact('ERC20');
const Governance = contract.fromArtifact('Governance');
const MintableToken = contract.fromArtifact('MintableToken');
const FightersMultiPeriodPool = fromArtifact(__dirname + '/../build/multi_period_pool_contracts', 'FightersMultiPeriodPool');
const TokenWhitelist = contract.fromArtifact('TokenWhitelist');

const bn = n => new BN(n);

const INIT_REWARD = bn(10).pow(bn(18+6))
const TOTAL_REWARD = bn(20).pow(bn(18+6))
const REDUCE_FACTOR = bn(50);
const PERIOD_DURATION = 60;
const TOTAL_DURATION = 650;

async function increaseTime(sec) {
    await new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {method: "evm_increaseTime", params: [sec.toNumber()]},
            (err, res) => err ? reject(err) : resolve(res)
        )
    });
    await new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {method: "evm_mine", params: []},
            (err, res) => err ? reject(err) : resolve(res)
        )
    });
}

let tokenCount = 0;
async function newToken(name, symbol, decimals) {
    tokenCount++;
    return MintableToken.new(name || `Token${tokenCount}`, symbol || `TKN${tokenCount}`, decimals || 18);
}

describe('FightersMultiPeriodPool', () => {
    const setup = async ({totalReward, initReward, starttime, endtime, reduceFactor, periodDuration, totalDuration} = {}) => {
        initReward = initReward || INIT_REWARD;
        const powerToken = await newToken("Power Token", "PWR", 18);
        const seedToken = await newToken();
        const pool = await FightersMultiPeriodPool.new(accounts[0]);

        let r = await powerToken.mint(pool.address, totalReward || TOTAL_REWARD);

        starttime = starttime || (await web3.eth.getBlock(r.receipt.blockNumber)).timestamp + 100
        endtime = endtime || starttime + (totalDuration || TOTAL_DURATION);
        reduceFactor = reduceFactor || REDUCE_FACTOR;
        periodDuration = periodDuration || PERIOD_DURATION;

        await pool.initialize(
            powerToken.address,
            seedToken.address,
            initReward,
            starttime,
            endtime,
            reduceFactor,
            periodDuration
        , {from: accounts[0]})

        await increaseTime(bn(100));

        return {
            powerToken,
            seedToken,
            pool
        }
    }

    it('stakes and gets rewards', async () => {
        const {powerToken, pool, seedToken} = await setup();

        const staker = accounts[1];
        const stake = bn(1);
        await seedToken.mint(staker, stake);
        await seedToken.approve(pool.address, stake, {from: staker});
        await pool.stake(stake, {from: staker});

        const duration = PERIOD_DURATION / 2 + 1;
        await increaseTime(bn(duration));

        let earned = await pool.earned(staker);
        expect(earned).to.be.bignumber.gt(INIT_REWARD.div(bn(2)));
        expect(earned).to.be.bignumber.lt(INIT_REWARD);
    });

    it('does not allow staking after pool ended, but allows unstaking', async () => {
        const {powerToken, pool, seedToken} = await setup();

        const staker = accounts[1];
        const stake = bn(1);
        await seedToken.mint(staker, stake);
        await seedToken.approve(pool.address, stake, {from: staker});
        await pool.stake(stake, {from: staker});

        await increaseTime(bn(TOTAL_DURATION));

        await seedToken.mint(staker, stake);
        await seedToken.approve(pool.address, stake, {from: staker});
        await expectRevert(pool.stake(stake, {from: staker}), "pool has ended");

        await pool.withdraw(stake, {from: staker});
        expect(await seedToken.balanceOf(staker)).to.bignumber.eq(stake.mul(bn(2)));

        await pool.getReward({from: staker});
        expect(await powerToken.balanceOf(staker)).to.bignumber.gt(INIT_REWARD.div(bn(2)));
    });

});