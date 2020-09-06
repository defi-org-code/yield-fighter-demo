const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const Web3 = require("web3");
const HDWalletProvider = require("truffle-hdwallet-provider");

const {
    BN,           // Big Number support
    constants
} = require('@openzeppelin/test-helpers');

const {
    MIN_POWER_TOKEN_BALANCER_RESERVE,
    BALANCER_POWER_TOKEN_WEIGHT,
} = require("./contract_consts");

const argv = yargs
    .option('config', {
        alias: 'c',
        description: 'Path to config file',
        default: 'deploy-config.json'
    }).help()
    .argv;

const config = require(path.resolve(process.cwd(), argv.config));

if (!config.EthereumURL) {
    throw new Error('"EthereumUrl" is a required configuration field');
}

if (!config.EthereumMnemonic) {
    throw new Error('"EthereumMnemonic" is a required configuration field');
}

if (!config.FundsAccount) {
    throw new Error('"FundsAccount" is a required configuration field');
}

console.log(`Deploying to endpoint: ${config.EthereumURL}`);

const web3 = new Web3(
    new HDWalletProvider(
        config.EthereumMnemonic,
        config.EthereumURL
    )
);

const bn = n => new BN(n);

async function deployContract(contractName, args, opts) {
    const accounts = await web3.eth.getAccounts();

    const build = require(`${__dirname}/build/governance_contracts/${contractName}.json`);
    const contract = await (new web3.eth.Contract(build.abi, {
        from: accounts[0],
        gasPrice: 1000000000,
        gas: 5000000,
    }).deploy({
        data: build.bytecode,
        arguments: args
    }).send({
        from: accounts[0],
        gasPrice: 1000000000,
        gas: 5000000,
        ...(opts || {})
    }));

    console.log(`Deployed ${contractName} at ${contract.options.address}`);
    return contract;
}

function publishContractJson(contractName, instanceName, address) {
    const buildFull = require(`${__dirname}/build/governance_contracts/${contractName}.json`);
    const networkId = 42; // kovan

    const build = {
        abi: buildFull.abi,
        networks: {
            [networkId]: {address}
        }
    }

    const targetPath = `${__dirname}/../www-app/src/lib/contracts/${instanceName}.json`;
    fs.writeFileSync(targetPath, JSON.stringify(build, null, 2));

    console.log(`Published ${instanceName} at ${address} to ${path.resolve(targetPath)}`);
}

async function frontendTestsSetup() {
    const options = {
        fightingTime: bn(5*60),
        farmingTime: bn(4*60),
        feeRate: bn(15),
        cooldownRounds: bn(3),
        launchPoolGracePeriod: bn(2*60)
    }

    console.log(`Root account: ${(await web3.eth.getAccounts())[0]}`);
    const fundsAddr = config.FundsAccount;

    const powerToken = await deployContract("MintableToken", ["Power Token", "PWR", bn(18)]);
    const fighterToken1 = await deployContract("MintableToken", ["Fighter Token 1", "WNR", bn(18)]);
    const fighterToken2 = await deployContract("MintableToken", ["Fighter Token 2", "WNR2", bn(18)]);
    const fighterToken3 = await deployContract("MintableToken", ["Fighter Token 3", "WNR3", bn(18)]);
    const fighterToken4 = await deployContract("MintableToken", ["Fighter Token 4", "WNR3", bn(18)]);

    const whitelist = await deployContract("TokenWhitelist", []);

    await whitelist.methods.addToWhitelist([
        fighterToken1.options.address,
        fighterToken2.options.address,
        fighterToken3.options.address,
        fighterToken4.options.address
    ]).send();

    const singlePeriodFactory = await deployContract("../single_period_pool_contracts/FightersSinglePeriodPoolFactory", []);
    const multiPeriodFactory = await deployContract("../multi_period_pool_contracts/FightersMultiPeriodPoolFactory", []);
    const fakeBFactory = await deployContract("BFactoryMock", []);

    const newBalancer = (token, powerWeight, powerReserve, name, symbol, decimal) =>  deployContract("BPoolMock", [true, [powerToken.options.address, token.options.address], [powerWeight, bn("100000000000000000").sub(powerWeight)], [powerReserve, 1], name, symbol, decimal]);
    const balancerToken1 = await newBalancer(fighterToken1, BALANCER_POWER_TOKEN_WEIGHT, MIN_POWER_TOKEN_BALANCER_RESERVE, "BP Fighter Token 1","BPW1", bn(18));
    const balancerToken2 = await newBalancer(fighterToken2, BALANCER_POWER_TOKEN_WEIGHT, MIN_POWER_TOKEN_BALANCER_RESERVE, "BP Fighter Token 2","BPW2", bn(18));
    const balancerToken3 = await newBalancer(fighterToken3, BALANCER_POWER_TOKEN_WEIGHT, MIN_POWER_TOKEN_BALANCER_RESERVE, "BP Fighter Token 3","BPW3", bn(18));
    const balancerToken4 = await newBalancer(fighterToken4, BALANCER_POWER_TOKEN_WEIGHT, MIN_POWER_TOKEN_BALANCER_RESERVE, "BP Fighter Token 4","BPW4", bn(18));

    await fakeBFactory.methods.addPool(balancerToken1.options.address).send();
    await fakeBFactory.methods.addPool(balancerToken2.options.address).send();
    await fakeBFactory.methods.addPool(balancerToken3.options.address).send();
    await fakeBFactory.methods.addPool(balancerToken4.options.address).send();

    await powerToken.methods.mint(fundsAddr, bn(250).mul(bn(10).pow(bn(18 + 3)))).send();
    await fighterToken1.methods.mint(fundsAddr, bn(250).mul(bn(10).pow(bn(18 + 3)))).send();
    await balancerToken1.methods.mint(fundsAddr, bn(250).mul(bn(10).pow(bn(18 + 3)))).send();
    await balancerToken2.methods.mint(fundsAddr, bn(250).mul(bn(10).pow(bn(18 + 3)))).send();
    await balancerToken3.methods.mint(fundsAddr, bn(250).mul(bn(10).pow(bn(18 + 3)))).send();
    await balancerToken4.methods.mint(fundsAddr, bn(250).mul(bn(10).pow(bn(18 + 3)))).send();

    const governance = await deployContract("Governance", [
        powerToken.options.address,
        whitelist.options.address,
        singlePeriodFactory.options.address,
        multiPeriodFactory.options.address,
        fakeBFactory.options.address,
        options.fightingTime,
        options.farmingTime,
        options.feeRate,
        options.cooldownRounds,
        options.launchPoolGracePeriod
    ]);
    
    await powerToken.methods.setMinter(governance.options.address).send();
    let r = await powerToken.methods.renounceOwnership().send();

    const starttime = (await web3.eth.getBlock(r.blockNumber)).timestamp + 1200;

    r = await governance.methods.createSinglePeriodPool(
        fighterToken1.options.address,
        bn(250).mul(bn(10).pow(bn(18 + 3))),
        starttime
    ).send();
    const singlePoolAddress = r.events.PoolCreated.returnValues.pool;
    console.log(`Single period pool created at ${singlePoolAddress}`);

    r = await governance.methods.createMultiPeriodPool(
        fighterToken1.options.address,
        bn(500).mul(bn(10).pow(bn(18 + 3))),
        bn(250).mul(bn(10).pow(bn(18 + 3))),
        bn(24*60*60),
        bn(50),
        starttime + 120,
        starttime + 120 + 30*24*60*60
    ).send();
    const multiPoolAddress = r.events.PoolCreated.returnValues.pool;
    console.log(`Multi period pool created at ${multiPoolAddress}`);

    publishContractJson("MintableToken", "PowerToken", powerToken.options.address);
    publishContractJson("MintableToken", "WinnerToken", fighterToken1.options.address);
    publishContractJson("MintableToken", "FighterToken2", fighterToken2.options.address);
    publishContractJson("MintableToken", "FighterToken3", fighterToken3.options.address);
    publishContractJson("MintableToken", "FighterToken4", fighterToken4.options.address);
    publishContractJson("BPoolMock", "WinnerTokenBalancer", balancerToken1.options.address);
    publishContractJson("BPoolMock", "FighterToken2Balancer", balancerToken2.options.address);
    publishContractJson("BPoolMock", "FighterToken3Balancer", balancerToken3.options.address);
    publishContractJson("BPoolMock", "FighterToken4Balancer", balancerToken4.options.address);
    publishContractJson("Governance", "Governance", governance.options.address);
    publishContractJson("../single_period_pool_contracts/FightersSinglePeriodPool", "WinnerPool", singlePoolAddress);
    publishContractJson("../multi_period_pool_contracts/FightersMultiPeriodPool", "FightersMultiPeriodPool", multiPoolAddress);
    publishContractJson("TokenWhitelist", "TokenWhitelist", whitelist.options.address);
}

frontendTestsSetup()
    .then(
        () => process.exit(0),
        e => {
            console.error(e);
            process.exit(1);
        }
    );
