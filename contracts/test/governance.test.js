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
const TokenWhitelist = contract.fromArtifact('TokenWhitelist');
const FightersSinglePeriodPool = fromArtifact(__dirname + '/../build/single_period_pool_contracts', 'FightersSinglePeriodPool');
const FightersSinglePeriodPoolFactory = fromArtifact(__dirname + '/../build/single_period_pool_contracts', 'FightersSinglePeriodPoolFactory');
const FightersMultiPeriodPoolFactory = fromArtifact(__dirname + '/../build/multi_period_pool_contracts', 'FightersMultiPeriodPoolFactory');
const BFactoryMock = contract.fromArtifact('BFactoryMock');
const BPoolMock = contract.fromArtifact('BPoolMock');

const bn = n => new BN(n);

const FEE_RATE = bn(15);
const FEE_BASE = bn(1000);
const COOLDOWN_ROUNDS = bn(2);
const FIGHTING_TIME = bn(3*24*60*60);
const FARMING_TIME = bn(7*24*60*60);
const LAUNCH_POOL_GRACE_PERIOD = bn(12*60*60);

const {
    MIN_POWER_TOKEN_BALANCER_RESERVE,
    BALANCER_POWER_TOKEN_WEIGHT,
    REWARDS_BASE,

    STATE_FIGHTING,
    STATE_FIGHTING_COMPLETE,
    STATE_FARMING
} = require("../contract_consts");

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

describe('Governance', () => {
    const setup = async ({dontSkipWarmup, cooldownRounds, launchPoolGracePeriod, endFighting} = {}) => {
        cooldownRounds = cooldownRounds != null ? cooldownRounds : COOLDOWN_ROUNDS;
        launchPoolGracePeriod = launchPoolGracePeriod != null ? launchPoolGracePeriod : LAUNCH_POOL_GRACE_PERIOD;

        const powerToken = await newToken("Power Token", "PWR", 18);

        const whitelist = await TokenWhitelist.new();

        const singlePeriodPoolFactory = await FightersSinglePeriodPoolFactory.new();
        const multiPeriodPoolFactory = await FightersMultiPeriodPoolFactory.new();
        const bFactory = await BFactoryMock.new();
        const governance = await Governance.new(powerToken.address, whitelist.address, singlePeriodPoolFactory.address, multiPeriodPoolFactory.address, bFactory.address,  FIGHTING_TIME, FARMING_TIME, FEE_RATE, cooldownRounds, launchPoolGracePeriod);

        let r = await powerToken.setMinter(governance.address);
        await expectEvent(r, 'MinterChanged', {
            newMinter: governance.address
        });

        const candidateToken = await newToken();
        const candidateToken2 = await newToken();
        const candidateToken3 = await newToken();
        await whitelist.addToWhitelist([candidateToken.address, candidateToken2.address, candidateToken3.address]);

        const newBalancer = (token, powerWeight, powerReserve, name, symbol, decimal) =>  BPoolMock.new(true, [powerToken.address, token.address], [powerWeight, bn("100000000000000000").sub(powerWeight)], [powerReserve, 1], name, symbol, decimal);
        const balancerToken = await newBalancer(candidateToken, BALANCER_POWER_TOKEN_WEIGHT, MIN_POWER_TOKEN_BALANCER_RESERVE, "BP Fighter Token 1","BPW1", bn(18));
        const balancerToken2 = await newBalancer(candidateToken2, BALANCER_POWER_TOKEN_WEIGHT, MIN_POWER_TOKEN_BALANCER_RESERVE, "BP Fighter Token 2","BPW2", bn(18));
        const balancerToken3 = await newBalancer(candidateToken3, BALANCER_POWER_TOKEN_WEIGHT, MIN_POWER_TOKEN_BALANCER_RESERVE, "BP Fighter Token 3","BPW3", bn(18));

        await bFactory.addPool(balancerToken.address);
        await bFactory.addPool(balancerToken2.address);
        await bFactory.addPool(balancerToken3.address);

        if (!dontSkipWarmup) {
            await increaseTime(FARMING_TIME);
        }

        if (endFighting) {
            await powerToken.mint(accounts[0], bn(10));
            await powerToken.approve(governance.address, bn(10), {from: accounts[0]});
            await governance.stakeAndBack(bn(10), candidateToken.address, {from: accounts[0]});
            await increaseTime(FIGHTING_TIME);
        }

        const withWeightedAmount = async (r, amount) => {
            const now = (await web3.eth.getBlock(r.receipt.blockNumber)).timestamp;
            const startTime = (await governance.getCurrentRound()).stateStartTime;

            return {
                r,
                weightedAmount: amount.mul(bn(startTime).add(FIGHTING_TIME).add(FIGHTING_TIME).sub(bn(now))).div(FIGHTING_TIME)
            }
        }

        const stakeAndBack = async (staker, amount, token) => {
            const r = await governance.stakeAndBack(amount, token, {from: staker});
            return withWeightedAmount(r, amount);
        }

        const stake = async (staker, amount) => {
            const r = await governance.stakePowerToken(amount, {from: staker});
            return withWeightedAmount(r, amount);
        }

        const back = async (staker, token) => {
            const amount = bn((await governance.stakers(staker)).total);
            const r = await governance.backToken(token, {from: staker});
            return withWeightedAmount(r, amount);
        }

        return {
            powerToken,
            governance,
            candidateToken,
            candidateToken2,
            candidateToken3,
            balancerToken,
            balancerToken2,
            balancerToken3,
            whitelist,
            bFactory,

            stake,
            back,
            stakeAndBack,
            newBalancer
        }
    }

    it('deploys a new single period pool', async () => {
        const {powerToken, governance} = await setup({dontSkipWarmup: true});
        const winnerToken = await ERC20.new();
        const starttime = (await web3.eth.getBlock()).timestamp + 100
        const r = await governance.createSinglePeriodPool(winnerToken.address, bn(2000), starttime);
        expectEvent(r, 'PoolCreated', {
            poolToken: winnerToken.address,
            mintedRewards: bn(2000),
        });
        const poolAddress = r.logs.filter(l => l.event == 'PoolCreated')[0].args.pool;
        await expectEvent.inTransaction(r.tx, powerToken,'Transfer', {
            from: constants.ZERO_ADDRESS,
            to: poolAddress,
            value: bn(2000)
        });

        const pool = await FightersSinglePeriodPool.at(poolAddress);
        expect(await powerToken.balanceOf(pool.address)).to.be.bignumber.eq(bn(2000));
    });

    it('deploys a new multi period pool', async () => {
        const {powerToken, governance} = await setup({dontSkipWarmup: true});
        const winnerToken = await ERC20.new();

        const starttime = (await web3.eth.getBlock()).timestamp + 100
        const endtime = starttime + 100;
        const r = await governance.createMultiPeriodPool(winnerToken.address, bn(2000), bn(1000), bn(60), bn(50), starttime, endtime);
        expectEvent(r, 'PoolCreated', {
            poolToken: winnerToken.address,
            mintedRewards: bn(2000),
            fees: bn(0),
        });
        const poolAddress = r.logs.filter(l => l.event == 'PoolCreated')[0].args.pool;
        await expectEvent.inTransaction(r.tx, powerToken,'Transfer', {
            from: constants.ZERO_ADDRESS,
            to: poolAddress,
            value: bn(2000)
        });

        const pool = await FightersSinglePeriodPool.at(poolAddress);
        expect(await powerToken.balanceOf(pool.address)).to.be.bignumber.eq(bn(2000));
    });

    it('only allows governance to mint', async () => {
        const {powerToken, governance, candidateToken} = await setup();

        const to = accounts[1];
        const nonMinter = accounts[2];
        await expectRevert(powerToken.mint(to, bn(1000), {from: nonMinter}), "caller is not a minter");
    });

    it('proposes a token, stakes and backs it', async () => {
        const {powerToken, governance, candidateToken, back, stake} = await setup();

        const token = candidateToken.address;
        const staker = accounts[1];

        const firstStakeAmount = bn(100);
        await expectRevert(governance.stakePowerToken(firstStakeAmount), "transfer amount exceeds balance");

        await powerToken.mint(staker, firstStakeAmount);
        await powerToken.approve(governance.address, firstStakeAmount, {from: staker});
        let r = await governance.stakePowerToken(firstStakeAmount, {from: staker});
        expectEvent(r, "StakedPowerToken", {
           staker,
           amount: firstStakeAmount,
           total: firstStakeAmount
        });

        let firstWeightedAmount;

        ({r, weightedAmount: firstWeightedAmount} = await back(staker, token));
        expectEvent(r, "PowerAddedToToken", {
            token,
            by: staker,
            added: firstWeightedAmount,
            total: firstWeightedAmount,
            round: bn(1),
        });
        const fee = firstStakeAmount.mul(FEE_RATE).div(FEE_BASE);
        expectEvent(r, "FeeCollected", {
            from: staker,
            amount: fee
        })

        const secondStakeAmount = bn(200);
        const secondFee = secondStakeAmount.mul(FEE_RATE).div(FEE_BASE);
        await powerToken.mint(staker, secondStakeAmount);
        await powerToken.approve(governance.address, secondStakeAmount, {from: staker});

        let secondWeightedAmount;
        ({r, weightedAmount: secondWeightedAmount} = await stake(staker, secondStakeAmount));
        expectEvent(r, "StakedPowerToken", {
            amount: secondStakeAmount,
            total: firstStakeAmount.sub(fee).add(secondStakeAmount).sub(secondFee)
        });
        expectEvent(r, "PowerAddedToToken", {
            token,
            by: staker,
            added: secondWeightedAmount,
            total: secondWeightedAmount.add(firstWeightedAmount),
            round: bn(1),
        });
        expectEvent(r, 'FeeCollected', {
            from: staker,
            amount: secondFee
        });

    });

    it('does not allow backing twice in the same round', async () => {
        const {powerToken, governance, candidateToken} = await setup();

        const token = candidateToken.address;
        const staker = accounts[1];

        let r = await governance.backToken(token, {from: staker});
        expectEvent(r, "PowerAddedToToken", {
            token,
            by: staker,
            added: bn(0),
            total: bn(0),
            round: bn(1),
        });

        await expectRevert(governance.backToken(token, {from: staker}), "staker already backed a token in this round");
    });

    it('stake-and-backs', async () => {
        const {powerToken, governance, candidateToken, stakeAndBack} = await setup();

        const token = candidateToken.address;
        const staker = accounts[1];

        const firstStakeAmount = bn(100);
        await expectRevert(governance.stakePowerToken(firstStakeAmount), "transfer amount exceeds balance");

        const fee = firstStakeAmount.mul(FEE_RATE).div(FEE_BASE);

        await powerToken.mint(staker, firstStakeAmount);
        await powerToken.approve(governance.address, firstStakeAmount, {from: staker});
        let {r, weightedAmount} = await stakeAndBack(staker, firstStakeAmount, token);
        expectEvent(r, "StakedPowerToken", {
            staker,
            amount: firstStakeAmount,
            total: firstStakeAmount
        });
        expectEvent(r, "PowerAddedToToken", {
            token,
            by: staker,
            added: weightedAmount,
            total: weightedAmount,
            round: bn(1),
        });
        expectEvent(r, "FeeCollected", {
            from: staker,
            amount: fee
        });
    });

    it('allows backer to withdraw only when current fighting round is complete', async () => {
        const {powerToken, governance, candidateToken, candidateToken2} = await setup();

        const token = candidateToken.address;
        const staker = accounts[1];
        const staker2 = accounts[2];
        const staker3 = accounts[3];

        const stakeAmount = bn(100);

        await powerToken.mint(staker, stakeAmount);
        await powerToken.approve(governance.address, stakeAmount, {from: staker});
        let r = await governance.stakeAndBack(stakeAmount, candidateToken.address, {from: staker});
        expectEvent(r, "StakedPowerToken", {
            staker,
            amount: stakeAmount,
            total: stakeAmount
        });

        await powerToken.mint(staker2, stakeAmount);
        await powerToken.approve(governance.address, stakeAmount, {from: staker2});
        r = await governance.stakeAndBack(stakeAmount, candidateToken.address, {from: staker2});
        expectEvent(r, "StakedPowerToken", {
            staker: staker2,
            amount: stakeAmount,
            total: stakeAmount
        });

        await powerToken.mint(staker3, stakeAmount);
        await powerToken.approve(governance.address, stakeAmount, {from: staker3});
        r = await governance.stakeAndBack(stakeAmount, candidateToken.address, {from: staker3});
        expectEvent(r, "StakedPowerToken", {
            staker: staker3,
            amount: stakeAmount,
            total: stakeAmount
        });

        await expectRevert(governance.withdraw({from: staker}), "funds are still locked");

        await increaseTime(FIGHTING_TIME.sub(bn(20)));
        await expectRevert(governance.withdraw({from: staker}), "funds are still locked");

        await increaseTime(bn(20));

        const amountMinusFees = stakeAmount.sub(stakeAmount.mul(FEE_RATE).div(FEE_BASE));

        r = await governance.withdraw({from: staker});
        expectEvent(r, 'StakeWithdrawn', {
            staker,
            amount: amountMinusFees
        });

        // Move to next fighting round
        await increaseTime(LAUNCH_POOL_GRACE_PERIOD);
        await governance.launchPool(constants.ZERO_ADDRESS);
        await increaseTime(FARMING_TIME);
        expect((await governance.getCurrentRound()).roundCount).to.bignumber.eq(bn(2));
        expect((await governance.getCurrentRound()).state).to.bignumber.eq(bn(STATE_FIGHTING));

        r = await governance.withdraw({from: staker2});
        expectEvent(r, 'StakeWithdrawn', {
            staker: staker2,
            amount: amountMinusFees
        });

        await governance.backToken(token, {from: staker3});
        await expectRevert(governance.withdraw({from: staker3}), "funds are still locked");
    });

    it('accumulates backing of two stakers', async () => {
        const {powerToken, governance, candidateToken, back} = await setup();

        const token = candidateToken.address;
        const staker1 = accounts[3];
        const staker2 = accounts[4];

        const staker1Amount = bn(100);
        const staker2Amount = bn(200);

        await powerToken.mint(staker1, staker1Amount);
        await powerToken.approve(governance.address, staker1Amount, {from: staker1});

        await powerToken.mint(staker2, staker2Amount);
        await powerToken.approve(governance.address, staker2Amount, {from: staker2});

        let r = await governance.stakePowerToken(staker1Amount, {from: staker1});
        expectEvent(r, "StakedPowerToken", {
            staker: staker1,
            amount: staker1Amount,
            total: staker1Amount
        });

        let weightedAmount1;
        ({r, weightedAmount: weightedAmount1} = await back(staker1, token));
        expectEvent(r, 'PowerAddedToToken', {
            by: staker1,
            added: weightedAmount1,
            total: weightedAmount1,
            round: bn(1),
        });

        r = await governance.stakePowerToken(staker2Amount, {from: staker2});
        expectEvent(r, "StakedPowerToken", {
            staker: staker2,
            amount: staker2Amount,
            total: staker2Amount,
        });

        ({r, weightedAmount: weightedAmount2} = await back(staker2, token));
        expectEvent(r, 'PowerAddedToToken', {
            by: staker2,
            added: weightedAmount2,
            total: weightedAmount2.add(weightedAmount1),
            round: bn(1),
        });
    });

    it('does not allow to back a non-whitelisted token', async () => {
        const {governance} = await setup();

        const token = await newToken();

        await expectRevert(governance.backToken(token.address), "not approved by whitelist");
    });

    it('tracks leading token and accumulates weighted power', async () => {
        const {governance, powerToken, candidateToken, candidateToken2, candidateToken3, stake, stakeAndBack} = await setup();
        let r, amount;
        let total1 = bn(0), total2 = bn(0), total3 = bn(0);

        const token1 = candidateToken.address;
        const token2 = candidateToken2.address;
        const token3 = candidateToken3.address;

        const staker1 = accounts[1];
        const staker2 = accounts[2];
        const staker3 = accounts[3];

        amount = bn(100);
        await powerToken.mint(staker1, amount);
        await powerToken.approve(governance.address, amount, {from: staker1});
        ({r, weightedAmount: weightedAmount} = await stakeAndBack(staker1, amount, token1));
        total1 = total1.add(weightedAmount);
        expectEvent(r, 'LeaderTokenChanged', {token: token1, power: total1});
        expect((await governance.getCurrentRound()).leadingToken).to.eq(token1);

        amount = bn(50);
        await powerToken.mint(staker2, amount);
        await powerToken.approve(governance.address, amount, {from: staker2});
        ({r, weightedAmount: weightedAmount} = await stakeAndBack(staker2, amount, token2));
        total2 = total2.add(weightedAmount);
        expectEvent.notEmitted(r, 'LeaderTokenChanged');
        expect((await governance.getCurrentRound()).leadingToken).to.eq(token1);

        amount = bn(60);
        await powerToken.mint(staker2, amount);
        await powerToken.approve(governance.address, amount, {from: staker2});
        ({r, weightedAmount: weightedAmount} = await stake(staker2, amount));
        total2 = total2.add(weightedAmount);
        expectEvent(r, 'LeaderTokenChanged', {token: token2, power: total2});
        expect((await governance.getCurrentRound()).leadingToken).to.eq(token2);

        amount = bn(20);
        await powerToken.mint(staker1, amount);
        await powerToken.approve(governance.address, amount, {from: staker1});
        ({r, weightedAmount: weightedAmount} = await stake(staker1, amount));
        total1 = total1.add(weightedAmount);
        expectEvent(r, 'LeaderTokenChanged', {token: token1, power: total1});
        expect((await governance.getCurrentRound()).leadingToken).to.eq(token1);

        amount = bn(130);
        await powerToken.mint(staker3, amount);
        await powerToken.approve(governance.address, amount, {from: staker3});
        ({r, weightedAmount: weightedAmount} = await stakeAndBack(staker3, amount, token3));
        total3 = total3.add(weightedAmount);
        expectEvent(r, 'LeaderTokenChanged', {token: token3, power: total3});
        expect((await governance.getCurrentRound()).leadingToken).to.eq(token3);
    });

    it('does not allow staking or backing when not in fighting state', async () => {
        const {governance, powerToken, candidateToken, candidateToken2, balancerToken, back} = await setup();

        const staker = accounts[1];
        const token = candidateToken.address;
        await powerToken.mint(staker, bn(100));
        await powerToken.approve(governance.address, bn(100), {from: staker});
        await governance.stakeAndBack(bn(100), token, {from: staker});

        const staker2 = accounts[2];
        const token2 = candidateToken2.address;
        await powerToken.mint(staker2, bn(10));
        await powerToken.approve(governance.address, bn(10), {from: staker2});
        await governance.stakeAndBack(bn(10), token2, {from: staker2});

        expect((await governance.getCurrentRound()).state).to.bignumber.eq(STATE_FIGHTING);

        await increaseTime(FIGHTING_TIME.add(bn(1)));

        expect((await governance.getCurrentRound()).state).to.bignumber.eq(STATE_FIGHTING_COMPLETE);
        expect((await governance.getCurrentRound()).leadingToken).to.eq(token);

        // No backing
        await expectRevert(governance.backToken(token), "this op cannot be performed in the current state");

        // No staking
        await powerToken.mint(staker2, bn(100));
        await powerToken.approve(governance.address, bn(100), {from: staker2});
        await expectRevert(governance.stakePowerToken(bn(100), {from: staker2}), "this op cannot be performed in the current state");

        // No stake-and-back
        await expectRevert(governance.stakeAndBack(bn(100), candidateToken.address, {from: staker2}), "this op cannot be performed in the current state");

        // Start farming state
        let r = await governance.launchPool(balancerToken.address);
        expectEvent(r, 'PoolCreated', {
            round: bn(1),
            poolToken: balancerToken.address
        })
        expect((await governance.farmingRounds(bn(1))).pool).to.eq(r.logs.find(e => e.event == "PoolCreated").args.pool);
        expect((await governance.getCurrentRound()).state).to.bignumber.eq(STATE_FARMING);

        // No backing
        await expectRevert(governance.backToken(token), "this op cannot be performed in the current state");

        // No staking
        await expectRevert(governance.stakePowerToken(bn(100), {from: staker2}), "this op cannot be performed in the current state");

        // No stake-and-back
        await expectRevert(governance.stakeAndBack(bn(100), candidateToken.address, {from: staker2}), "this op cannot be performed in the current state");

        expect((await governance.getCurrentRound()).roundCount).to.bignumber.eq(bn(1));
        await increaseTime(FARMING_TIME);
        expect((await governance.getCurrentRound()).roundCount).to.bignumber.eq(bn(2));

        // New round, backing/staking is now allowed
        ({r, weightedAmount} = await back(staker, token2));
        expectEvent(r, 'PowerAddedToToken', {
            by: staker,
            added: weightedAmount,
            total: weightedAmount,
            round: bn(2)
        });

        r = await governance.stakePowerToken(bn(100), {from: staker2});
        expectEvent(r, 'StakedPowerToken', {
            staker: staker2,
        });
    });

    it('emits initial backing event only on first backing', async () => {
        const {governance, powerToken, candidateToken} = await setup();

        const staker = accounts[1];
        const token = candidateToken.address;
        await powerToken.mint(staker, bn(100));
        await powerToken.approve(governance.address, bn(100), {from: staker});
        let r = await governance.stakeAndBack(bn(100), token, {from: staker});
        expectEvent(r, 'InitialBacking', {
            round: bn(1),
            token,
            backer: staker
        })

        const staker2 = accounts[2];
        await powerToken.mint(staker2, bn(10));
        await powerToken.approve(governance.address, bn(10), {from: staker2});
        r = await governance.stakeAndBack(bn(10), token, {from: staker2});
        expectEvent.notEmitted(r, 'InitialBacking');
    });

    it('does not allow to back a winning token for COOLDOWN_ROUNDS rounds', async () => {
        const {governance, powerToken, candidateToken, candidateToken2, candidateToken3, balancerToken, balancerToken2, balancerToken3} = await setup();

        const winners = [candidateToken.address, candidateToken2.address, candidateToken3.address, candidateToken.address];
        const balancers = [balancerToken.address, balancerToken2.address, balancerToken3.address, balancerToken.address];
        for (const winner of winners) {
            const staker = accounts[1];
            await powerToken.mint(staker, bn(100));
            await powerToken.approve(governance.address, bn(100), {from: staker});

            if (winner != winners[0]) {
                await expectRevert(governance.stakeAndBack(bn(100), winners[0], {from: staker}), 'cannot back a token which won recently');
            }
            await governance.stakeAndBack(bn(100), winner, {from: staker});

            await increaseTime(FIGHTING_TIME.add(bn(1)));

            // Start farming state
            let r = await governance.launchPool(balancers[winners.indexOf(winner)]);

            expectEvent(r, 'PoolCreated', {
               poolToken: balancers[winners.indexOf(winner)]
            });

            await increaseTime(FARMING_TIME);

            expect((await governance.getCurrentRound()).state).to.bignumber.eq(STATE_FIGHTING);
        }
    });

    it('runs for 10 rounds', async () => {
        const {governance, powerToken, candidateToken, balancerToken} = await setup({cooldownRounds: 0});

        for (let round = 1; round < 10; round++) {
            const staker = accounts[round];
            const stake = bn(100);
            await powerToken.mint(staker, stake);
            await powerToken.approve(governance.address, stake, {from: staker});
            await governance.stakeAndBack(stake, candidateToken.address, {from: staker});

            await increaseTime(FIGHTING_TIME);

            const tokenPower = (await governance.tokens(candidateToken.address)).totalPower;
            const fees = stake.mul(FEE_RATE).div(FEE_BASE);
            const totalSupply = bn(await powerToken.totalSupply());
            const mintedRewards = REWARDS_BASE.mul(tokenPower).div(totalSupply);
            let r = await governance.launchPool(balancerToken.address);
            expectEvent(r, 'PoolCreated', {
                mintedRewards,
                fees
            });
            const pool = (await governance.farmingRounds(round)).pool;
            expect(await powerToken.balanceOf(pool)).to.bignumber.eq(fees.add(mintedRewards));

            await increaseTime(FARMING_TIME);
        }
    });

    it('does not launch a pool after grace period', async () => {
        const {governance, powerToken, candidateToken, balancerToken} = await setup({cooldownRounds: 0});

        const staker = accounts[1];
        const stake = bn(100);
        await powerToken.mint(staker, stake);
        await powerToken.approve(governance.address, stake, {from: staker});
        await governance.stakeAndBack(stake, candidateToken.address, {from: staker});

        await increaseTime(FIGHTING_TIME.add(LAUNCH_POOL_GRACE_PERIOD).add(bn(1)));

        let r = await governance.launchPool(balancerToken.address);
        let now = bn((await web3.eth.getBlock(r.receipt.blockNumber)).timestamp);
        let currentRoundNumber = (await governance.getCurrentRound()).roundCount;

        expectEvent(r, 'LaunchPoolCalledAfterGracePeriod', {
            round: bn(1),
            winnerToken: candidateToken.address
        });
        expectEvent.notEmitted(r, 'PoolCreated');

        expect((await governance.getCurrentRound()).state).to.bignumber.eq(STATE_FARMING);
        expect((await governance.getCurrentRound()).stateStartTime).to.bignumber.eq(now);
        expect((await governance.farmingRounds(currentRoundNumber)).pool).to.eql(constants.ZERO_ADDRESS);

        await increaseTime(FARMING_TIME.add(bn(1)));

        expect((await governance.getCurrentRound()).state).to.bignumber.eq(STATE_FIGHTING);

        await increaseTime(FARMING_TIME);
    });

    it('accumulates weighted power and launches pool with propotional rewards on balancer token', async () => {
        const {governance, powerToken, candidateToken, balancerToken, stake, stakeAndBack} = await setup();
        let r, amount;
        let total = bn(0);

        const token = candidateToken.address;

        const staker = accounts[1];

        await increaseTime(FIGHTING_TIME.div(bn(4)));

        amount = bn(100);
        await powerToken.mint(staker, amount);
        await powerToken.approve(governance.address, amount, {from: staker});
        ({r, weightedAmount: weightedAmount} = await stakeAndBack(staker, amount, token));
        total = total.add(weightedAmount);
        expectEvent(r, 'LeaderTokenChanged', {token: token, power: total});
        expect((await governance.getCurrentRound()).leadingToken).to.eq(token);

        await increaseTime(FIGHTING_TIME.div(bn(4)));

        await powerToken.mint(staker, amount);
        await powerToken.approve(governance.address, amount, {from: staker});
        ({r, weightedAmount: weightedAmount} = await stake(staker, amount));
        total = total.add(weightedAmount);
        expect((await governance.tokens(token)).totalPower).to.bignumber.eq(total);

        await increaseTime(FIGHTING_TIME.div(bn(4)));

        await powerToken.mint(staker, amount);
        await powerToken.approve(governance.address, amount, {from: staker});
        ({r, weightedAmount: weightedAmount} = await stake(staker, amount));
        total = total.add(weightedAmount);
        expect((await governance.tokens(token)).totalPower).to.bignumber.eq(total);

        await increaseTime(FIGHTING_TIME.div(bn(4)));

        const totalSupply = bn(await powerToken.totalSupply());

        r = await governance.launchPool(balancerToken.address);
        expectEvent(r, 'PoolCreated', {
            round: bn(1),
            poolToken: balancerToken.address,
            mintedRewards: REWARDS_BASE.mul(total).div(totalSupply)
        });

        expect((await governance.farmingRounds(1)).baseToken).to.eq(token);
        expect((await governance.farmingRounds(1)).tokenTotalPower).to.bignumber.eq(total);

        const pool = await FightersSinglePeriodPool.at((await governance.farmingRounds(1)).pool);
        expect(await pool.winnerToken()).to.eq(balancerToken.address);
        expect(await pool.powerToken()).to.eq(powerToken.address);
    });

    it('does not launch a pool if token is not created by balancer factory', async () => {
        const {governance, candidateToken, newBalancer} = await setup({endFighting: true});

        const balancer = await newBalancer(candidateToken, BALANCER_POWER_TOKEN_WEIGHT, MIN_POWER_TOKEN_BALANCER_RESERVE,"Testing BP", "BPT", bn(18));
        await expectRevert(governance.launchPool(balancer.address), "balancer is not created by BFactory");
    });

    it('does not launch a pool if balancer is not finalized', async () => {
        const {governance, candidateToken, powerToken, bFactory} = await setup({endFighting: true});

        const balancer = await BPoolMock.new(
            false,
            [powerToken.address, candidateToken.address],
            [BALANCER_POWER_TOKEN_WEIGHT, bn(1)],
            [MIN_POWER_TOKEN_BALANCER_RESERVE, bn(1)],
            "Testing BP",
            "BPT",
            bn(18)
        );
        await bFactory.addPool(balancer.address);
        await expectRevert(governance.launchPool(balancer.address), "ERR_NOT_FINALIZED");
    });

    it('does not launch a pool if balancer does not have exactly 2 tokens', async () => {
        const {governance, candidateToken, powerToken, bFactory} = await setup({endFighting: true});

        const balancer = await BPoolMock.new(
            true,
            [powerToken.address, candidateToken.address, accounts[0]],
            [BALANCER_POWER_TOKEN_WEIGHT, bn(1), bn(2)],
            [MIN_POWER_TOKEN_BALANCER_RESERVE, bn(1), bn(2)],
            "Testing BP",
            "BPT",
            bn(18)
        );
        await bFactory.addPool(balancer.address);
        await expectRevert(governance.launchPool(balancer.address), "balancer must contain exactly 2 tokens");
    });

    it('does not launch a pool if balancer does not contain powerToken or winnerToken', async () => {
        const {governance, candidateToken, powerToken, bFactory} = await setup({endFighting: true});

        let balancer = await BPoolMock.new(
            true,
            [powerToken.address, accounts[0]],
            [BALANCER_POWER_TOKEN_WEIGHT, bn(2)],
            [MIN_POWER_TOKEN_BALANCER_RESERVE, bn(2)],
            "Testing BP",
            "BPT",
            bn(18)
        );
        await bFactory.addPool(balancer.address);
        await expectRevert(governance.launchPool(balancer.address), "balancer must be for powerToken and winnerToken");

        balancer = await BPoolMock.new(
            true,
            [accounts[0], candidateToken.address],
            [BALANCER_POWER_TOKEN_WEIGHT, bn(1)],
            [MIN_POWER_TOKEN_BALANCER_RESERVE, bn(1)],
            "Testing BP",
            "BPT",
            bn(18)
        );
        await bFactory.addPool(balancer.address);
        await expectRevert(governance.launchPool(balancer.address), "balancer must be for powerToken and winnerToken");
    });

    it('does not launch a pool if balancer does not have enough power token reserves', async () => {
        const {governance, candidateToken, newBalancer, bFactory} = await setup({endFighting: true});

        const balancer = await newBalancer(candidateToken, BALANCER_POWER_TOKEN_WEIGHT, MIN_POWER_TOKEN_BALANCER_RESERVE.sub(bn(1)),"Testing BP", "BPT", bn(18));
        await bFactory.addPool(balancer.address);
        await expectRevert(governance.launchPool(balancer.address), "balancer does not have enough power token balance");
    });

    it('does not launch a pool if balancer does not have the expected weight for the power token', async () => {
        const {governance, candidateToken, newBalancer, bFactory} = await setup({endFighting: true});

        const balancer1 = await newBalancer(candidateToken, BALANCER_POWER_TOKEN_WEIGHT.sub(bn(1)), MIN_POWER_TOKEN_BALANCER_RESERVE,"Testing BP", "BPT", bn(18));
        await bFactory.addPool(balancer1.address);
        await expectRevert(governance.launchPool(balancer1.address), "balancer not set with correct weight for power token");

        const balancer2 = await newBalancer(candidateToken, BALANCER_POWER_TOKEN_WEIGHT.add(bn(1)), MIN_POWER_TOKEN_BALANCER_RESERVE,"Testing BP", "BPT", bn(18));
        await bFactory.addPool(balancer2.address);
        await expectRevert(governance.launchPool(balancer2.address), "balancer not set with correct weight for power token");
    });

});