// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TEST_CONTRACT101 is ERC20, Ownable {
    constructor()
        ERC20("TEST_TOKEN 101", "TTK")
    {
        _mint(msg.sender, 100000000 * 10 ** decimals());
    } 
}