import BigNumber from "bignumber.js";
import Web3 from "web3";

import Governance from "./contracts/Governance.json";
import LaunchPools from "./pool0.json";
import PowerToken from "./contracts/PowerToken.json";
import TokensJson from "./tokens.json";
import WinnerPool from "./contracts/WinnerPool.json";
import WinnerToken from "./contracts/WinnerToken.json";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const STATE_FIGHTING = 1;
export const STATE_FIGHTING_COMPLETE = 2;
export const STATE_FARMING = 3;

const POWER_TOKEN_DECIMALS = 18;
const FIGHTING_TIME = 5 * 60;
const FARMING_TIME = 4 * 60;

export class YieldFighters {
  constructor(provider, networkId, options) {
    let realProvider;
    if (typeof provider === "string") {
      if (provider.includes("wss")) {
        realProvider = new Web3.providers.WebsocketProvider(provider, options.ethereumNodeTimeout || 10000);
      } else {
        realProvider = new Web3.providers.HttpProvider(provider, options.ethereumNodeTimeout || 10000);
      }
    } else {
      realProvider = provider;
    }
    this.options = options;
    this.web3 = new Web3(realProvider);
    this.networkId = networkId;
    this.contracts = this.initContracts(networkId);
  }

  setDefaultAccount(account) {
    this.web3.eth.defaultAccount = account;
  }

  initContracts(networkId) {
    const res = {};
    res.Governance = new this.web3.eth.Contract(Governance.abi, Governance.networks[networkId].address);
    res.PowerToken = new this.web3.eth.Contract(PowerToken.abi, PowerToken.networks[networkId].address);
    return res;
  }

  getPoolContract(address) {
    if (!this.poolContractCache) this.poolContractCache = {};
    if (!this.poolContractCache[address]) {
      this.poolContractCache[address] = new this.web3.eth.Contract(WinnerPool.abi, address);
    }
    return this.poolContractCache[address];
  }

  getTokenContract(address) {
    if (!this.tokenContractCache) this.tokenContractCache = {};
    if (!this.tokenContractCache[address]) {
      this.tokenContractCache[address] = new this.web3.eth.Contract(WinnerToken.abi, address);
    }
    return this.tokenContractCache[address];
  }

  async fetchCurrentRound() {
    const res = {
      leadingToken: ZERO_ADDRESS,
      totalPower: "0",
      stateStartTime: 0,
      roundCount: 0,
      state: 0,
      fightingEndTimestamp: 0,
      farmingEndTimestamp: 0,
    };
    try {
      const currentRound = await this.contracts.Governance.methods.getCurrentRound().call();
      res.leadingToken = currentRound.leadingToken;
      res.totalPower = this.formatFullAmountToUser(currentRound.totalWeightedPower, POWER_TOKEN_DECIMALS);
      res.state = parseInt(currentRound.state);
      res.stateStartTime = parseInt(currentRound.stateStartTime);
      if (res.state === STATE_FIGHTING) res.fightingEndTimestamp = res.stateStartTime + FIGHTING_TIME;
      if (res.state === STATE_FARMING) res.farmingEndTimestamp = res.stateStartTime + FARMING_TIME;
      res.roundCount = parseInt(currentRound.roundCount);
    } catch (err) {
      console.error(err);
    }
    return res;
  }

  async fetchPoolDetails(roundNumber, currentRound, subPoolName) {
    if (roundNumber === 0) return this.fetchLaunchPoolDetails(currentRound, subPoolName);

    const poolLatest = roundNumber === currentRound.roundCount;
    const res = {
      roundNumber: roundNumber,
      poolStarted: roundNumber < currentRound.roundCount || (poolLatest && currentRound.state === STATE_FARMING),
      poolCanStart: poolLatest && currentRound.state === STATE_FIGHTING_COMPLETE,
      poolLatest,
      poolLive: poolLatest && currentRound.state === STATE_FARMING,
      poolStartTime: 0,
      poolAddress: ZERO_ADDRESS,
      poolTokenDetails: undefined,
      winnerTokenAddress: ZERO_ADDRESS,
    };
    try {
      if (res.poolStarted) {
        const farmingRound = await this.contracts.Governance.methods.farmingRounds(roundNumber).call();
        if (farmingRound) {
          res.poolAddress = farmingRound.pool;
          res.winnerTokenAddress = farmingRound.baseToken;
          res.poolTokenDetails = await this.fetchTokenDetails(farmingRound.poolToken);
        }
      } else if (res.poolCanStart) {
        res.winnerTokenAddress = currentRound.leadingToken;
      }
      if (res.poolAddress !== ZERO_ADDRESS) {
        const startTime = await this.getPoolContract(res.poolAddress).methods.starttime().call();
        res.poolStartTime = parseInt(startTime);
      }
    } catch (err) {
      console.error(err);
    }
    return res;
  }

  async fetchLaunchPoolDetails(currentRound, subPoolName) {
    if (!subPoolName) return LaunchPools;
    const subPool = LaunchPools.subPools[subPoolName];
    if (!subPool) return false;

    const poolLatest = 0 === currentRound.roundCount;
    const res = {
      roundNumber: 0,
      poolStarted: true,
      poolCanStart: false,
      poolLive: poolLatest && currentRound.state === STATE_FARMING,
      poolLatest,
      poolStartTime: subPool.poolStartTime,
      poolAddress: subPool.poolAddress,
      poolTokenDetails: undefined,
      winnerTokenAddress: ZERO_ADDRESS,
    };
    try {
      let poolToken = subPool.seedToken.address;
      if (poolToken !== ZERO_ADDRESS) {
        res.winnerTokenAddress = poolToken;
        res.poolTokenDetails = await this.fetchTokenDetails(poolToken);
      }
    } catch (err) {
      console.error(err);
    }
    return res;
  }

  async fetchTokenDetails(seedTokenAddress) {
    if (seedTokenAddress === ZERO_ADDRESS) return undefined;
    const res = {
      seedTokenAddress: seedTokenAddress,
      harvestTokenAddress: this.contracts.PowerToken.options.address,
      seedDecimals: -1,
      harvestDecimals: POWER_TOKEN_DECIMALS,
    };
    try {
      const seedDecimals = await this.getTokenContract(seedTokenAddress).methods.decimals().call();
      res.seedDecimals = parseInt(seedDecimals);
    } catch (err) {
      console.error(err);
    }
    return res;
  }

  async fetchTokenBalances(account, poolTokenDetails) {
    const res = {
      seedBalance: "",
      harvestBalance: "",
    };
    try {
      const seedBalance = await this.getTokenContract(poolTokenDetails.seedTokenAddress)
        .methods.balanceOf(account)
        .call();
      res.seedBalance = this.formatFullAmountToUser(seedBalance, poolTokenDetails.seedDecimals);
      const harvestBalance = await this.contracts.PowerToken.methods.balanceOf(account).call();
      res.harvestBalance = this.formatFullAmountToUser(harvestBalance, poolTokenDetails.harvestDecimals);
    } catch (err) {
      console.error(err);
    }
    return res;
  }

  async fetchPoolBalances(account, poolDetails) {
    const res = {
      seedStaked: "",
      harvestEarned: "",
    };
    try {
      const seedStaked = await this.getPoolContract(poolDetails.poolAddress).methods.balanceOf(account).call();
      res.seedStaked = this.formatFullAmountToUser(seedStaked, poolDetails.poolTokenDetails.seedDecimals);
      const harvestEarned = await this.getPoolContract(poolDetails.poolAddress).methods.earned(account).call();
      res.harvestEarned = this.formatFullAmountToUser(harvestEarned, poolDetails.poolTokenDetails.harvestDecimals);
    } catch (err) {
      console.error(err);
    }
    return res;
  }

  async fetchPowerStaking(account) {
    const res = {
      powerBalance: "",
      powerLocked: "",
      stakedAtRound: 0,
      backedAtRound: 0,
      tokenBacked: ZERO_ADDRESS,
    };
    try {
      const powerBalance = await this.contracts.PowerToken.methods.balanceOf(account).call();
      res.powerBalance = this.formatFullAmountToUser(powerBalance, POWER_TOKEN_DECIMALS);
      const staker = await this.contracts.Governance.methods.stakers(account).call();
      res.powerLocked = this.formatFullAmountToUser(staker.total, POWER_TOKEN_DECIMALS);
      res.stakedAtRound = parseInt(staker.stakedAtRound);
      res.backedAtRound = parseInt(staker.backedAtRound);
      res.tokenBacked = staker.token;
    } catch (err) {
      console.error(err);
    }
    return res;
  }

  async fetchTopFighters(roundNumber, maxFighters = 5, minFighters = 4) {
    const allAvailableTokens = Object.keys(TokensJson);
    const top = [];
    try {
      const initialBackings = await this.contracts.Governance.getPastEvents("InitialBacking", {
        filter: { round: roundNumber },
        fromBlock: 0,
        toBlock: "latest",
      });
      for (const event of initialBackings) {
        const token = event.returnValues.token;
        const tokenStats = await this.contracts.Governance.methods.tokens(token).call();
        top.push({
          token,
          totalPower: this.formatFullAmountToUser(tokenStats.totalPower, POWER_TOKEN_DECIMALS),
        });
      }
      top.sort((a, b) => a.comparedTo(b));
    } catch (err) {
      console.error(err);
    }
    const res = top.slice(0, maxFighters);

    // if we don't have enough fighters, add some random ones
    while (res.length < minFighters) {
      const randToken = allAvailableTokens[Math.floor(Math.random() * allAvailableTokens.length)];
      let alreadyFound = false;
      for (const existingResult of res) {
        if (existingResult.token.toLowerCase() === randToken.toLowerCase()) alreadyFound = true;
      }
      if (!alreadyFound)
        res.push({
          token: randToken,
          totalPower: "0",
        });
    }
    return res;
  }

  // poolTokenAddress is the Balancer Pool Token (BPT) of the winner token
  async sendLaunchPool(poolTokenAddress) {
    const account = this.web3.eth.defaultAccount;
    return new Promise((resolve, reject) => {
      this.contracts.Governance.methods
        .launchPool(poolTokenAddress)
        .send({ from: account, gas: 2000000 }, (err, txHash) => {
          if (err) reject(err);
          else resolve(txHash);
        });
    });
  }

  async sendPoolApproveAndStake(account, poolDetails, amount) {
    const fullAmount = this.formatUserToFullAmount(amount, poolDetails.poolTokenDetails.seedDecimals);
    const batch = new this.web3.BatchRequest();
    const promises = [];
    const promise1 = new Promise((resolve, reject) => {
      const tx1 = this.getTokenContract(poolDetails.poolTokenDetails.seedTokenAddress)
        .methods.approve(poolDetails.poolAddress, fullAmount)
        .send.request({ from: account, gas: 80000 }, (err, txHash) => {
          if (err) reject(err);
          else resolve(txHash);
        });
      batch.add(tx1);
    });
    promises.push(promise1);
    const promise2 = new Promise((resolve, reject) => {
      const tx2 = this.getPoolContract(poolDetails.poolAddress)
        .methods.stake(fullAmount)
        .send.request({ from: account, gas: 200000 }, (err, txHash) => {
          if (err) reject(err);
          else resolve(txHash);
        });
      batch.add(tx2);
    });
    promises.push(promise2);
    batch.execute();
    return Promise.all(promises);
  }

  async sendPoolUnstake(account, poolDetails, amount) {
    const fullAmount = this.formatUserToFullAmount(amount, poolDetails.poolTokenDetails.seedDecimals);
    return new Promise((resolve, reject) => {
      this.getPoolContract(poolDetails.poolAddress)
        .methods.withdraw(fullAmount)
        .send({ from: account, gas: 200000 }, (err, txHash) => {
          if (err) reject(err);
          else resolve(txHash);
        });
    });
  }

  async sendPoolWithdraw(account, poolDetails) {
    return new Promise((resolve, reject) => {
      this.getPoolContract(poolDetails.poolAddress)
        .methods.getReward()
        .send({ from: account, gas: 200000 }, (err, txHash) => {
          if (err) reject(err);
          else resolve(txHash);
        });
    });
  }

  async sendPoolUnstakeAllAndWithdraw(account, poolDetails) {
    return new Promise((resolve, reject) => {
      this.getPoolContract(poolDetails.poolAddress)
        .methods.exit()
        .send({ from: account, gas: 200000 }, (err, txHash) => {
          if (err) reject(err);
          else resolve(txHash);
        });
    });
  }

  async sendWithdrawPower(account) {
    return new Promise((resolve, reject) => {
      this.contracts.Governance.methods.withdraw().send({ from: account, gas: 200000 }, (err, txHash) => {
        if (err) reject(err);
        else resolve(txHash);
      });
    });
  }

  async sendBackFighter(account, tokenAddress, additionalAmount, powerStaking, currentRound) {
    const fullAmount = this.formatUserToFullAmount(additionalAmount, POWER_TOKEN_DECIMALS);
    let shouldBack = powerStaking.backedAtRound !== currentRound.roundCount;
    const batch = new this.web3.BatchRequest();
    const promises = [];
    if (fullAmount !== "0") {
      const promise1 = new Promise((resolve, reject) => {
        const tx1 = this.contracts.PowerToken.methods
          .approve(this.contracts.Governance.options.address, fullAmount)
          .send.request({ from: account, gas: 80000 }, (err, txHash) => {
            if (err) reject(err);
            else resolve(txHash);
          });
        batch.add(tx1);
      });
      promises.push(promise1);
      if (shouldBack) {
        const promise2 = new Promise((resolve, reject) => {
          const tx2 = this.contracts.Governance.methods
            .stakeAndBack(fullAmount, tokenAddress)
            .send.request({ from: account, gas: 400000 }, (err, txHash) => {
              if (err) reject(err);
              else resolve(txHash);
            });
          batch.add(tx2);
        });
        promises.push(promise2);
        shouldBack = false;
      } else {
        const promise2 = new Promise((resolve, reject) => {
          const tx2 = this.contracts.Governance.methods
            .stakePowerToken(fullAmount)
            .send.request({ from: account, gas: 200000 }, (err, txHash) => {
              if (err) reject(err);
              else resolve(txHash);
            });
          batch.add(tx2);
        });
        promises.push(promise2);
      }
    }
    if (shouldBack) {
      const promise3 = new Promise((resolve, reject) => {
        const tx3 = this.contracts.Governance.methods
          .backToken(tokenAddress)
          .send.request({ from: account, gas: 200000 }, (err, txHash) => {
            if (err) reject(err);
            else resolve(txHash);
          });
        batch.add(tx3);
      });
      promises.push(promise3);
    }
    batch.execute();
    return Promise.all(promises);
  }

  async fetchTransactionStatus(txHash) {
    const receipt = await this.web3.eth.getTransactionReceipt(txHash);
    if (receipt == null) return "pending";
    const currentBlockNumber = await this.web3.eth.getBlockNumber();
    const confirmations = this.options.defaultConfirmations || 1;
    if (currentBlockNumber - receipt.blockNumber < confirmations) return "confirming";
    if (receipt.status) return "successful";
    else return "reverted";
  }

  formatFullAmountToUser(fullAmount, decimals) {
    const res = new BigNumber(fullAmount).dividedBy(new BigNumber(10).pow(decimals));
    if (res.eq(0)) return "0";
    if (res.lt(1)) return res.toPrecision(4);
    else return res.toFixed(2);
  }

  formatUserToFullAmount(amount, decimals) {
    const res = new BigNumber(amount).times(new BigNumber(10).pow(decimals));
    return res.integerValue(BigNumber.ROUND_FLOOR).toString(10);
  }
}
