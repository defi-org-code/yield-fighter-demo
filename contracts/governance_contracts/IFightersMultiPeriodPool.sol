pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFightersMultiPeriodPool {

    function initialize(
        IERC20 _powerToken,
        IERC20 _lpToken,
        uint256 _reward,
        uint256 _starttime,
        uint256 _endtime,
        uint256 _rewardReduceFactor,
        uint256 _periodDuration
    ) external;

}