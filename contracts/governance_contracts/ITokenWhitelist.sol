pragma solidity ^0.5.0;

interface ITokenWhitelist {

    function isWhitelisted(address token) external view returns (bool);

}