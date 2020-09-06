pragma solidity ^0.5.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./IMintable.sol";
import "./ITokenWhitelist.sol";
import "./IFightersPoolFactory.sol";
import "./IBPool.sol";
import "./IBFactory.sol";
import "./IFightersSinglePeriodPool.sol";
import "./IFightersMultiPeriodPool.sol";

contract Governance is Ownable {

    using SafeMath for uint256;

    event StakedPowerToken(address staker, uint256 amount, uint256 total);
    event PoolCreated(uint32 round, address poolToken, uint256 mintedRewards, uint256 fees, uint256 starttime, address pool);
    event LaunchPoolCalledAfterGracePeriod(uint32 indexed round, address winnerToken);
    event StakeWithdrawn(address staker, uint256 amount);
    event InitialBacking(uint32 indexed round, address token, address backer);
    event PowerAddedToToken(uint32 indexed round, address token, address by, uint added, uint total);
    event FeeCollected(address from, uint amount);
    event LeaderTokenChanged(uint32 indexed round, address token, uint power);

    uint256 constant FEE_BASE = 1000;
    uint256 constant REWARDS_BASE = 100000000000000000000000;
    uint256 constant POOL_MINT_AMOUNT_REDUCE_BASE = 1000;
    uint256 constant MIN_POWER_TOKEN_BALANCER_RESERVE = 10000000000000000000;
    uint256 constant BALANCER_POWER_TOKEN_WEIGHT = 20000000000000000;

    address public powerToken;

    ITokenWhitelist public  whitelist;
    IFightersPoolFactory public singlePeriodPoolFactory;
    IFightersPoolFactory public multiPeriodPoolFactory;
    IBFactory public balancerFactory;

    struct Settings {
        uint32 feeRate;
        uint32 cooldownRounds;
        uint32 fightingTime;
        uint32 farmingTime;
        uint32 launchPoolGracePeriod;
    }
    Settings public settings;

    struct Staker {
        uint256 total;
        uint backedAtRound;
        address token;
    }

    mapping (address => Staker) public stakers;

    struct Token {
        address addr;
        uint totalPower;
        uint32 roundCount;
        uint32 lastWinningRound;
        bool backed;
    }

    mapping (address => Token) public tokens;

    uint8 constant STATE_FIGHTING = 1;
    uint8 constant STATE_FIGHTING_COMPLETE = 2;
    uint8 constant STATE_FARMING = 3;

    struct Round {
        uint256 totalWeightedPower;
        address leadingToken;
        uint32 stateStartTime;
        uint32 roundCount;
        uint8 state;
    }

    Round public currentRound;
    uint256 public collectedFees;

    struct FarmingRound {
        address baseToken;
        address poolToken;
        uint256 tokenTotalPower;
        address pool;
    }

    mapping (uint => FarmingRound) public farmingRounds;

    constructor(
        address _powerToken,
        ITokenWhitelist _whitelist,
        IFightersPoolFactory _singlePeriodPoolFactory,
        IFightersPoolFactory _multiPeriodPoolFactory,
        IBFactory _balancerFactory,
        uint32 _fightingTime,
        uint32 _farmingTime,
        uint32 _feeRate,
        uint32 _cooldownRounds,
        uint32 _launchPoolGracePeriod
    ) public {
        powerToken = _powerToken;
        singlePeriodPoolFactory = _singlePeriodPoolFactory;
        multiPeriodPoolFactory = _multiPeriodPoolFactory;
        balancerFactory = _balancerFactory;

        settings = Settings({
            fightingTime: _fightingTime,
            farmingTime: _farmingTime,
            feeRate: _feeRate,
            cooldownRounds: _cooldownRounds,
            launchPoolGracePeriod: _launchPoolGracePeriod
        });
        whitelist = _whitelist;

        currentRound.state = STATE_FARMING;
        currentRound.stateStartTime = uint32(now);
    }

    modifier inState(uint state) {
        require(updateRound().state == state, "this op cannot be performed in the current state");

        _;
    }

    modifier inWarmupRound {
        require(updateRound().roundCount == 0, "this op is only allowed during the warmup round");

        _;
    }

    //
    // Public
    //

    function createSinglePeriodPool(address token, uint256 rewards, uint256 starttime) external onlyOwner inWarmupRound returns (IFightersSinglePeriodPool pool) {
        pool = _createWinnerPool(token, rewards, 0, starttime);
        emit PoolCreated(0, token, rewards, 0, starttime, address(pool));
    }

    function createMultiPeriodPool(address token, uint256 totalRewards, uint256 firstPeriodRewards, uint256 periodDuration, uint256 rewardReduceFactor, uint256 starttime, uint256 endtime) external onlyOwner inWarmupRound returns (IFightersMultiPeriodPool pool) {
        pool = IFightersMultiPeriodPool(multiPeriodPoolFactory.create());

        address _powerToken = powerToken;
        IMintable(_powerToken).mint(address(pool), totalRewards);
        pool.initialize(IERC20(_powerToken), IERC20(token), firstPeriodRewards, starttime, endtime, rewardReduceFactor, periodDuration);

        emit PoolCreated(0, token, totalRewards, 0, starttime, address(pool));
    }

    function stakePowerToken(uint amount) public inState(STATE_FIGHTING) {
        require(IERC20(powerToken).transferFrom(msg.sender, address(this), amount), "transfer failed");

        uint32 roundCount = currentRound.roundCount;
        Staker memory staker = stakers[msg.sender];

        uint newTotal = staker.total.add(amount);
        stakers[msg.sender].total = newTotal;

        if (staker.backedAtRound == roundCount && staker.token != address(0)) {
            addTokenTotalPower(staker.token, msg.sender, amount);
        }

        emit StakedPowerToken(msg.sender, amount, stakers[msg.sender].total);
    }

    function backToken(address token) public inState(STATE_FIGHTING) {
        Staker memory staker = stakers[msg.sender];
        uint roundCount = currentRound.roundCount;

        bool backed = tokens[token].backed;
        if (!backed) {
            backed = whitelist.isWhitelisted(token);
            tokens[token].backed = backed;
        }

        require(backed, "token to back is not approved by whitelist");
        require(staker.backedAtRound != currentRound.roundCount, "staker already backed a token in this round");

        uint32 lastWinningRound = tokens[token].lastWinningRound;
        require(lastWinningRound == 0 || lastWinningRound + settings.cooldownRounds < roundCount, "cannot back a token which won recently");

        stakers[msg.sender].backedAtRound = roundCount;
        stakers[msg.sender].token = token;

        addTokenTotalPower(token, msg.sender, staker.total);
    }

    function stakeAndBack(uint amount, address token) external inState(STATE_FIGHTING) {
        stakePowerToken(amount);
        backToken(token);
    }

    function launchPool(address poolToken) external inState(STATE_FIGHTING_COMPLETE) {
        Settings memory _settings = settings;
        Round memory _round = currentRound;

        IFightersSinglePeriodPool pool;

        bool duringLaunchPoolGrace = now - _round.stateStartTime <= _settings.launchPoolGracePeriod;
        bool hasWinner = _round.leadingToken != address(0);

        if (duringLaunchPoolGrace && hasWinner) {
            requireValidBalancer(IBPool(poolToken), _round.leadingToken);

            uint256 mintedRewards = REWARDS_BASE.mul(_round.totalWeightedPower).div(IERC20(powerToken).totalSupply());
            uint256 _collectedFees = collectedFees;
            collectedFees = 0;

            uint starttime = block.timestamp + 60;

            pool = _createWinnerPool(poolToken, mintedRewards, _collectedFees, starttime);
            tokens[_round.leadingToken].lastWinningRound = _round.roundCount;
            emit PoolCreated(_round.roundCount, poolToken, mintedRewards, _collectedFees, starttime, address(pool));

        }

        _round.state = STATE_FARMING;
        _round.stateStartTime = uint32(now);

        currentRound = _round;

        farmingRounds[_round.roundCount] = FarmingRound({
            baseToken: _round.leadingToken,
            poolToken: poolToken,
            tokenTotalPower: tokens[_round.leadingToken].totalPower,
            pool: address(pool)
        });

        if (!duringLaunchPoolGrace) {
            emit LaunchPoolCalledAfterGracePeriod(_round.roundCount, address(_round.leadingToken));
        }
    }

    function withdraw() external {
        Round memory _currentRound = updateRound();

        Staker storage staker = stakers[msg.sender];
        require(staker.backedAtRound < _currentRound.roundCount || _currentRound.state != STATE_FIGHTING, "funds are still locked");

        uint total = staker.total;

        staker.token = address(0);
        staker.backedAtRound = 0;
        staker.total = 0;
        require(IERC20(powerToken).transfer(msg.sender, total), "transfer failed");

        emit StakeWithdrawn(msg.sender, total);
    }

    function getCurrentRound() external view returns (
        address leadingToken,
        uint32 stateStartTime,
        uint32 roundCount,
        uint8 state,
        uint256 totalWeightedPower
    ) {
        (Round memory round,) = _getCurrentRound();
        leadingToken = round.leadingToken;
        stateStartTime = round.stateStartTime;
        roundCount = round.roundCount;
        state = round.state;
        totalWeightedPower = round.totalWeightedPower;
    }

    //
    // Private
    //

    function addTokenTotalPower(address token, address by, uint256 unweightedAmount) private {
        Round memory _currentRound = currentRound;

        uint256 totalTokenPower = tokens[token].totalPower;

        uint32 roundCount = _currentRound.roundCount;
        if (tokens[token].roundCount != roundCount) {
            totalTokenPower = 0;
            tokens[token].roundCount = roundCount;
        }

        uint256 weightedAmount = toWeightedAmount(_currentRound, unweightedAmount);

        uint256 newTotalPower = totalTokenPower.add(weightedAmount);
        tokens[token].totalPower = newTotalPower;

        if (totalTokenPower == 0 && newTotalPower > 0) {
            emit InitialBacking(roundCount, token, by);
        }

        currentRound.totalWeightedPower = _currentRound.totalWeightedPower.add(weightedAmount);

        uint fee = unweightedAmount.mul(settings.feeRate).div(FEE_BASE);
        uint total = stakers[msg.sender].total;
        stakers[msg.sender].total = total.sub(fee);
        collectedFees = collectedFees.add(fee);

        emit FeeCollected(by, fee);
        emit PowerAddedToToken(roundCount, token, by, weightedAmount, newTotalPower);

        updateLeadingToken(token, newTotalPower);
    }

    function toWeightedAmount(Round memory _currentRound, uint unweightedAmount) private view returns (uint) {
        uint fightingTime = settings.fightingTime;
        return unweightedAmount.mul(uint(_currentRound.stateStartTime).add(fightingTime).add(fightingTime).sub(now)).div(fightingTime);
    }

    function updateLeadingToken(address token, uint256 total) private {
        uint leadingTotal = tokens[address(currentRound.leadingToken)].totalPower;
        if (total > leadingTotal) {
            currentRound.leadingToken = token;
            emit LeaderTokenChanged(currentRound.roundCount, token, total);
        }
    }

    function updateRound() private returns (Round memory round) {
        bool changed;
        (round, changed) = _getCurrentRound();
        if (changed) currentRound = round;
    }

    function _createWinnerPool(address poolToken, uint256 mintedRewards, uint256 fees, uint starttime) private returns (IFightersSinglePeriodPool) {
        IFightersSinglePeriodPool pool = IFightersSinglePeriodPool(singlePeriodPoolFactory.create());

        address _powerToken = powerToken;
        IMintable(_powerToken).mint(address(pool), mintedRewards);
        if (fees > 0) {
            require(IERC20(_powerToken).transfer(address(pool), fees) == true, "transfer failed");
        }
        pool.initialize(IERC20(_powerToken), IERC20(poolToken), mintedRewards.add(fees), starttime);

        return pool;
    }

    function _getCurrentRound() private view returns (Round memory round, bool changed) {
        round = currentRound;

        if (round.state == STATE_FARMING) {
            uint32 farmingEnd = round.stateStartTime + settings.farmingTime;
            if (now >= farmingEnd) {
                round = Round({
                    state: STATE_FIGHTING,
                    leadingToken: address(0),
                    stateStartTime: uint32(farmingEnd),
                    roundCount: round.roundCount + 1,
                    totalWeightedPower: 0
                });
                changed = true;
            }
        }

        if (round.state == STATE_FIGHTING) {
            uint32 fightingEnd = round.stateStartTime + settings.fightingTime;
            if (now >= fightingEnd) {
                round = Round({
                    state: STATE_FIGHTING_COMPLETE,
                    leadingToken: round.leadingToken,
                    stateStartTime: fightingEnd,
                    roundCount: round.roundCount,
                    totalWeightedPower: round.totalWeightedPower
                });
                changed = true;
            }
        }
    }

    function requireValidBalancer(IBPool balancer, address baseToken) private view {
        address _powerToken = powerToken;
        IBFactory _balancerFactory = balancerFactory;
        require(_balancerFactory.isBPool(address(balancer)), "balancer is not created by BFactory");
        require(balancer.getNumTokens() == 2, "balancer must contain exactly 2 tokens");

        address[] memory _tokens = balancer.getFinalTokens();
        require(_tokens[0] == baseToken && _tokens[1] == _powerToken || _tokens[1] == baseToken && _tokens[0] == _powerToken, "balancer must be for powerToken and winnerToken");

        require(balancer.getBalance(_powerToken) >= MIN_POWER_TOKEN_BALANCER_RESERVE, "balancer does not have enough power token balance");
        require(balancer.getNormalizedWeight(_powerToken) == BALANCER_POWER_TOKEN_WEIGHT, "balancer not set with correct weight for power token");
    }

}