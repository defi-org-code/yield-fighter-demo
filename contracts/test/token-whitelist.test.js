const fs = require("fs");
const web3 = require("web3");
const {expect, use} = require('chai');

const { accounts, contract } = require('@openzeppelin/test-environment');

const {
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
    BN
} = require('@openzeppelin/test-helpers');

const TokenWhitelist = contract.fromArtifact('TokenWhitelist');
const MintableToken = contract.fromArtifact('MintableToken');

const MIN_USDT_RESERVES = new BN("50000000000");
const GENERATE_SOL_TOKENS_CODE = false;

describe('TokenWhitelist', () => {
    if (GENERATE_SOL_TOKENS_CODE) {
        // Generate solidity tokens code
        const targetPath = `${__dirname}/../../www-app/src/lib/tokens-150.json`;
        const jsonString = fs.readFileSync(targetPath);
        const tokens = JSON.parse(jsonString);
        console.log("\n\n");
        console.log("Generated Code:\n")
        console.log(`address[] memory initialTokens = new address[](${Object.entries(tokens).length});`);
        for (const [index, [tokenAddress, tokenDetails]] of Object.entries(Object.entries(tokens))) {
            console.log(`initialTokens[${index}] = ${web3.utils.toChecksumAddress(tokenAddress)};  // ${tokenDetails.name}`);
        }
        console.log(`_addToWhitelist(initialTokens);`);
    }

    const setup = async ({} = {}) => {
        const whitelist = await TokenWhitelist.new();

        return {
            whitelist,
        }
    }

    it('adds, removes and check whitelist', async () => {
        const { whitelist } = await setup();

        const tokenKucoin = "0x039b5649a59967e3e936d7471f9c3700100ee1ab"; // Kucoin Shares
        const tokenHuobiPoolToken = "0xa66daa57432024023db65477ba87d4e7f5f95213"; // HuobiPoolToken
        const tokenFalconSwap = "0xfffffffFf15AbF397dA76f1dcc1A1604F45126DB";  // FalconSwap Token
        const token1 = accounts[1];
        const token2 = accounts[2];

        expect(await whitelist.isWhitelisted(web3.utils.toChecksumAddress(tokenKucoin))).to.be.true;
        expect(await whitelist.isWhitelisted(web3.utils.toChecksumAddress(tokenHuobiPoolToken))).to.be.true;
        expect(await whitelist.isWhitelisted(web3.utils.toChecksumAddress(tokenFalconSwap))).to.be.true;

        expect(await whitelist.isWhitelisted(token1)).to.be.false;
        expect(await whitelist.isWhitelisted(token2)).to.be.false;

        await expectRevert(whitelist.addToWhitelist([token1, token2], {from: accounts[3]}), "caller is not the owner")
        let r = await whitelist.addToWhitelist([token1, token2]);
        expectEvent(r, 'TokenAdded', {token: token1})
        expectEvent(r, 'TokenAdded', {token: token2})

        expect(await whitelist.isWhitelisted(token1)).to.be.true;
        expect(await whitelist.isWhitelisted(token2)).to.be.true;
    });

    // it('allows a uniswap derived token which meets conditions', async () => {
    //     const { whitelist, uniswapFactory, usdt } = await setup();
    //
    //     const baseToken = accounts[1];
    //     await whitelist.addToWhitelist([baseToken]);
    //
    //     const pair = await UniswapPairMock.new(baseToken, usdt.address, 10, MIN_USDT_RESERVES);
    //
    //     await uniswapFactory.setPair(pair.address);
    //
    //     expect(await whitelist.isWhitelisted(pair.address)).to.be.false;
    //     expect(await whitelist.isApproved(pair.address)).to.be.true;
    // })
    //
    // it('does not allow a uniswap pair if not enough usdt reserves', async () => {
    //     const { whitelist, uniswapFactory, usdt } = await setup();
    //
    //     const baseToken = accounts[1];
    //     await whitelist.addToWhitelist([baseToken]);
    //
    //     const pair = await UniswapPairMock.new(baseToken, usdt.address, 10, MIN_USDT_RESERVES.sub(new BN(1)));
    //
    //     await uniswapFactory.setPair(pair.address);
    //
    //     expect(await whitelist.isApproved(pair.address)).to.be.false;
    // })
    //
    // it('does not allow a uniswap pair if does not have the correct hash', async () => {
    //     const { whitelist, uniswapFactory, usdt } = await setup();
    //
    //     const baseToken = accounts[1];
    //     await whitelist.addToWhitelist([baseToken]);
    //
    //     const pair = uniswapFactory; // not a pair
    //
    //     await uniswapFactory.setPair(pair.address);
    //
    //     expect(await whitelist.isApproved(pair.address)).to.be.false;
    // });
    //
    // it('does not allow a uniswap pair if pair is not a contract', async () => {
    //     const { whitelist, uniswapFactory, usdt } = await setup();
    //
    //     const baseToken = accounts[1];
    //     await whitelist.addToWhitelist([baseToken]);
    //
    //     const pair = accounts[0]; // not a pair
    //
    //     await uniswapFactory.setPair(pair);
    //
    //     expect(await whitelist.isApproved(pair)).to.be.false;
    // });
    //
    // it('does not allow a uniswap derived token if not recognized by factory', async () => {
    //     const { whitelist, uniswapFactory, usdt } = await setup();
    //
    //     const baseToken = accounts[1];
    //     await whitelist.addToWhitelist([baseToken]);
    //
    //     const pair = await UniswapPairMock.new(baseToken, usdt.address, 10, MIN_USDT_RESERVES);
    //
    //     const realPair = accounts[0];
    //     await uniswapFactory.setPair(realPair);
    //
    //     expect(await whitelist.isApproved(pair.address)).to.be.false;
    // });
    //
    // it('does not allow a uniswap derived token where non of the tokens are usdt', async () => {
    //     const { whitelist, uniswapFactory, usdt } = await setup();
    //
    //     const baseToken = accounts[1];
    //     await whitelist.addToWhitelist([baseToken]);
    //
    //     const nonUsdtToken = accounts[0]
    //     const pair = await UniswapPairMock.new(baseToken, nonUsdtToken, 10, MIN_USDT_RESERVES);
    //
    //     await uniswapFactory.setPair(pair.address);
    //
    //     expect(await whitelist.isApproved(pair.address)).to.be.false;
    // });

});