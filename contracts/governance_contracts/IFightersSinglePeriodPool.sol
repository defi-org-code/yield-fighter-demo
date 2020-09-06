pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFightersSinglePeriodPool {
    function initialize(
        IERC20 _powerToken,
        IERC20 _winnerToken,
        uint256 _reward,
        uint256 _starttime
    ) external;
}