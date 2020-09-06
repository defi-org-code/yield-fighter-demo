pragma solidity ^0.5.0;

import "./FightersSinglePeriodPool.sol";

contract FightersSinglePeriodPoolFactory {

    function create() external returns (address) {
        return address(new FightersSinglePeriodPool(msg.sender));
    }

}