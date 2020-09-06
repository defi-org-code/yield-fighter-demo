pragma solidity ^0.5.0;

import "./FightersMultiPeriodPool.sol";

contract FightersMultiPeriodPoolFactory {

    function create() external returns (address) {
        return address(new FightersMultiPeriodPool(msg.sender));
    }

}