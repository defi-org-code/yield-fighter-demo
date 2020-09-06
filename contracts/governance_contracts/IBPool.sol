pragma solidity ^0.5.0;

interface IBPool {

    function getFinalTokens()
    external view
    returns (address[] memory tokens);

    function getNormalizedWeight(address token)
    external view
    returns (uint);

    function getBalance(address token)
    external view
    returns (uint);

    function getNumTokens()
    external view
    returns (uint);
}