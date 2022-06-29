pragma solidity ^0.5.0;

import "./ITRC20.sol";

contract Agent {
    address _owner;

    constructor(address owner) public {
        _owner = owner;
    }

    function transfer(ITRC20 token) public payable {
        require(msg.sender == _owner);
        require(msg.value > 0);
        token.transfer(_owner, msg.value);
    }
}