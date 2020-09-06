pragma solidity ^0.5.0;

import "../IBFactory.sol";

contract BFactoryMock is IBFactory {

    mapping (address => bool) pools;

    function isBPool(address b)
    external view returns (bool) {
        return pools[b];
    }

    function addPool(address p) external {
        pools[p] = true;
    }

}