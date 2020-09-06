pragma solidity ^0.5.0;

import "../IBPool.sol";
import "../MintableToken.sol";

contract BPoolMock is IBPool, MintableToken {

    bool finalized;
    address[] tokens;
    mapping(address => uint) weights;
    mapping(address => uint) balances;

    constructor(
        bool _finalized,
        address[] memory _tokens,
        uint[] memory _weights,
        uint[] memory _balances,
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) MintableToken(_name, _symbol, _decimals) public
    {
        finalized = _finalized;
        tokens = _tokens;
        for (uint i = 0; i < _tokens.length; i++) {
            weights[_tokens[i]] = _weights[i];
            balances[_tokens[i]] = _balances[i];
        }
    }

    function getFinalTokens()
    external view
    returns (address[] memory) {
        require(finalized, "ERR_NOT_FINALIZED");
        return tokens;
    }

    function getNumTokens()
    external view
    returns (uint) {
        return tokens.length;
    }

    function getNormalizedWeight(address token)
    external view
    returns (uint) {
        return weights[token];
    }

    function getBalance(address token)
    external view
    returns (uint) {
        return balances[token];
    }
}