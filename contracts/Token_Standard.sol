// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CONTRACT_NAME is ERC20, Ownable {
    constructor()
        ERC20("TOKEN_NAME", "TOKEN_SYMBOL")
    {
        _mint(msg.sender, 100000000 * 10 ** decimals());
    } 
}