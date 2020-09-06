pragma solidity ^0.5.0;

interface IMintable {

    function mint(address account, uint256 amount) external /* onlyMinter */;

}