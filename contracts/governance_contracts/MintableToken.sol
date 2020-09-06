pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract MintableToken is ERC20, ERC20Detailed, Ownable {

    event MinterChanged(address newMinter);

    address public minter;

    modifier onlyMinter() {
        require(msg.sender == minter || msg.sender == owner(), "caller is not a minter");

        _;
    }

    function setMinter(address newMinter) public onlyOwner {
        minter = newMinter;
        emit MinterChanged(newMinter);
    }

    function mint(address account, uint256 amount) external onlyMinter {
        _mint(account, amount);
    }

    constructor(string memory name, string memory symbol, uint8 decimals) public ERC20Detailed(name, symbol, decimals) {
        setMinter(msg.sender);
    }

}