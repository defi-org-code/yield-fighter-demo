# Yield Fighter Solidity Contracts

Ethereum Solidity contracts for Yield Fighter. Consists of three separate truffle projects: Governance, single-period pool and multi-period pool.

## Contract structure

* `/governance_contracts` - Managing fighting and farming rounds.

    * `/Governance.sol` - The main governance contract for fighting and farming rounds. Includes logic for staking POW tokens, backing fighters, creating farming pools.

    * `/TokenWhitelist.sol` - A whitelist of ERC20 tokens that are allowed to participate as fighters.

    * `/tests` - A set of mocks for [Balancer](https://balancer.finance/) contracts (pool, and pool factory) used for testing.

* `/single_period_pool_contracts` - A farming pool that is active for a single period. These are the main type of pools used in the ongoing model (every time a fighter wins, a single period pool is created for them).

* `/multi_period_pool_contracts` - A farming pool that is active for multiple periods, each period distributes a portion of the rewards from the previous period. This type of pool can be considered for round 0 (the launch round).

The farming pools are a slightly modified version of the pools used by the [YAM project](https://github.com/yam-finance/yam-protocol/tree/master/contracts/distribution).

## Prerequisits

This project requires NodeJs. Run `npm install` to instal dependencies.

## Running tests locally

Run `npm test`

## Deployment

### Testing

1. Edit `/deploy-config.json`:

    * `EthereumURL` - An Ethereum endpoint.

        * `http://127.0.0.1:8545` when testing on Ganache.

        * `https://kovan.infura.io/v3/62f48XXXXXXXXXXXXXXXXXXXXXXXXXXX` when testing on Kovan (replace with your API key).

    * `EthereumMnemonic` - The mnemonic for the deployer account.

        * Generate a new one just to be safe, other people may have access to the one in this repo.

    * `FundsAccount` - An account to which the deployment script will mint Power and candidate tokens for testing.

        * If you don't have one, create a new account with MetaMask and use its address.

2. Run `npm run deploy`

    * To run with a different configuration file, run: `npm run deploy -- -c <path-to-config>`

    * This command will deploy the set of governance contracts along with four candidate tokens (and corresponding balancer pool mocks). 

3. For end-to-end test involving the client (`www-app`), you should test on Kovan or change the network ID in `www-app/src/config.json`.

## Production

TBD
