pragma solidity ^0.5.0;

import "./ITRC20.sol";

contract Agent {
    address _owner;

    constructor(address owner) public {
        _owner = owner;
    }

    function transfer(address token, address payable from, uint256 amount) public payable {
        require(amount > 0, "Amount must be greater than 0");
        bool res = ITRC20(token).transferFrom(from, _owner, amount);
        require(res, "Transfer failed");
    }
}