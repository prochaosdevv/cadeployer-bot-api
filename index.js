const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const RequestModel = require('./models/requests')
const { deployContractBscTestnet, deployStandardToken } = require('./controller/deploy');
const { flattenCode, generateRandomWalletKey } = require('./utils/general');
const { createUser } = require('./controller/user');
const { CreateRequest,UpdateRequest } = require('./controller/request');
const connectDatabase = require('./utils/dbConnection');
const { verify } = require('./controller/verify');

const botRotues = require("./routes/botRoutes");
const { ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
connectDatabase();


// UpdateRequest({request_id: "653aad5840ba4970a5d19f4a"  , updateData : {network: '56'}});



// Create User function
// createUser({username: "testyasir123"})



//Create User Wallet
// const {address , privateKey} = generateRandomWalletKey(3);
// console.log(address,privateKey);
 
//create request
// CreateRequest({user: "testyasir123"})

//update request
// UpdateRequest ({})


// Deploy Contract
// const user = "testyasir12345"
// const network = 97;
// const tokenSymbol = "TTK105"
// const tokenName = "TEST_TOKEN 105"
// const contractName = tokenName
// const ROUTER_ADDRESS = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3" ;
// const OWNER = "0xDa1F73bC73D6CF230a3DC16630Ef0b3825D80C9F"; 
// const TOTAL_SUPPLY = 1000000;
// const BUY_MAX = 2;
// const SELL_MAX = 2; 
// const MAX_WALLET = 4;
// const SWAP_TOKENS_AT = 100; // two decimal
// const BUY_OP_FEE= 1;
// const BUY_LIQ_FEE= 1;
// const BUY_TREASURY_FEE = 1;
// const SELL_OP_FEE = 2;
// const SELL_TREASURY_FEE = 2; 
// const SELL_LIQ_FEE = 2;
// const CA_CLOCK_PER = 10;
// const OPERATING_ADDRESS= "0xDa1F73bC73D6CF230a3DC16630Ef0b3825D80C9F";
// const TREASURY_ADDRESS = "0xDa1F73bC73D6CF230a3DC16630Ef0b3825D80C9F"; 

// deployStandardToken({verifyContractNow: true,USER : user,CONTRACT_NAME : contractName, TOKEN_SYMBOL: tokenSymbol,TOKEN_NAME: tokenName, ROUTER_ADDRESS: ROUTER_ADDRESS, OWNER : OWNER, TOTAL_SUPPLY : TOTAL_SUPPLY, BUY_MAX: BUY_MAX, SELL_MAX : SELL_MAX, MAX_WALLET : MAX_WALLET, SWAP_TOKENS_AT : SWAP_TOKENS_AT, BUY_OP_FEE : BUY_OP_FEE, BUY_LIQ_FEE : BUY_LIQ_FEE , BUY_TREASURY_FEE : BUY_TREASURY_FEE, SELL_OP_FEE : SELL_OP_FEE, SELL_TREASURY_FEE : SELL_TREASURY_FEE, SELL_LIQ_FEE : SELL_LIQ_FEE, OPERATING_ADDRESS : OPERATING_ADDRESS, TREASURY_ADDRESS : TREASURY_ADDRESS, CA_CLOCK_PER: CA_CLOCK_PER})


// // Verify Contract
// const contractName = "TEST_CONTRACT104"
// const contract = "0x2746b2F3535375Eac4F37f54b9A4C0FeE22511a3" ; 
// const user = "testyasir12345"
// verify({username: user},contractName,contract)

app.use("/bot" , botRotues)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});





























