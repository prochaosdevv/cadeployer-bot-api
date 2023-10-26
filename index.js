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
const app = express();
const port = process.env.PORT || 3000;
connectDatabase();

// Define a route
app.get('/', (req, res) => {
  res.send('!');
});

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
const user = "testyasir12345"
const network = 97;
const tokenSymbol = "TTK105"
const tokenName = "TEST_TOKEN 105"
const contractName = tokenName
const ROUTER_ADDRESS = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3" ;
const OWNER = "0xDa1F73bC73D6CF230a3DC16630Ef0b3825D80C9F"; 
const TOTAL_SUPPLY = 1000000;
const BUY_MAX = 2;
const SELL_MAX = 2; 
const MAX_WALLET = 4;
const SWAP_TOKENS_AT = 100; // two decimal
const BUY_OP_FEE= 1;
const BUY_LIQ_FEE= 1;
const BUY_TREASURY_FEE = 1;
const SELL_OP_FEE = 2;
const SELL_TREASURY_FEE = 2; 
const SELL_LIQ_FEE = 2;
const CA_CLOCK_PER = 10;
const OPERATING_ADDRESS= "0xDa1F73bC73D6CF230a3DC16630Ef0b3825D80C9F";
const TREASURY_ADDRESS = "0xDa1F73bC73D6CF230a3DC16630Ef0b3825D80C9F"; 

deployStandardToken({verifyContractNow: true,USER : user,CONTRACT_NAME : contractName, TOKEN_SYMBOL: tokenSymbol,TOKEN_NAME: tokenName, ROUTER_ADDRESS: ROUTER_ADDRESS, OWNER : OWNER, TOTAL_SUPPLY : TOTAL_SUPPLY, BUY_MAX: BUY_MAX, SELL_MAX : SELL_MAX, MAX_WALLET : MAX_WALLET, SWAP_TOKENS_AT : SWAP_TOKENS_AT, BUY_OP_FEE : BUY_OP_FEE, BUY_LIQ_FEE : BUY_LIQ_FEE , BUY_TREASURY_FEE : BUY_TREASURY_FEE, SELL_OP_FEE : SELL_OP_FEE, SELL_TREASURY_FEE : SELL_TREASURY_FEE, SELL_LIQ_FEE : SELL_LIQ_FEE, OPERATING_ADDRESS : OPERATING_ADDRESS, TREASURY_ADDRESS : TREASURY_ADDRESS, CA_CLOCK_PER: CA_CLOCK_PER})


// // Verify Contract
// const contractName = "TEST_CONTRACT104"
// const contract = "0x2746b2F3535375Eac4F37f54b9A4C0FeE22511a3" ; 
// const user = "testyasir12345"
// verify({username: user},contractName,contract)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



////////////////////////////////////////////bot/////////////////////////////////////////////

const token = '6956854579:AAFnPsDFL03U7Eso6q0-d3ljbdaOi7hCTh8'; 
const bot = new TelegramBot(token, { polling: true });
const userStates = {};

bot.onText(/\/start/, (msg) => {
 const chatId = msg.chat.id;
 bot.sendMessage(chatId, 'Welcome to your bot! Please select a network (e.g., 97) to continue.');
 userStates[chatId] = { awaitingNetwork: true };
});

bot.on('message', async (msg) => {
 const chatId = msg.chat.id;
 const text = msg.text;

 if (userStates[chatId] && userStates[chatId].awaitingNetwork) {
   userStates[chatId].network = parseInt(text, 10);
   userStates[chatId].awaitingNetwork = false;
   bot.sendMessage(chatId, 'Please enter the user value:');
 } else if (userStates[chatId] && !userStates[chatId].awaitingNetwork) {
   userStates[chatId].user = text;
   userStates[chatId].awaitingTokenSymbol = true;
   bot.sendMessage(chatId, 'Please enter the token symbol:');
 } else if (userStates[chatId] && userStates[chatId].awaitingTokenSymbol) {
   userStates[chatId].tokenSymbol = text;
   userStates[chatId].awaitingTokenName = true;
   bot.sendMessage(chatId, 'Please enter the token name:');
 } else if (userStates[chatId] && userStates[chatId].awaitingTokenName) {
   userStates[chatId].tokenName = text;
   userStates[chatId].awaitingContractName = true;
   bot.sendMessage(chatId, 'Please enter the contract name:');
 } else if (userStates[chatId] && userStates[chatId].awaitingContractName) {
   userStates[chatId].contractName = text;
   userStates[chatId].awaitingRouterAddress = true;
   bot.sendMessage(chatId, 'Please enter the router address:');
 } else if (userStates[chatId] && userStates[chatId].awaitingRouterAddress) {
   userStates[chatId].ROUTER_ADDRESS = text;
   userStates[chatId].awaitingOwner = true;
   bot.sendMessage(chatId, 'Please enter the owner address:');
 } else if (userStates[chatId] && userStates[chatId].awaitingOwner) {
   userStates[chatId].OWNER = text;
   userStates[chatId].awaitingTotalSupply = true;
   bot.sendMessage(chatId, 'Please enter the total supply:');
 } else if (userStates[chatId] && userStates[chatId].awaitingTotalSupply) {
   userStates[chatId].TOTAL_SUPPLY = parseInt(text, 10);
   userStates[chatId].awaitingBuyMax = true;
   bot.sendMessage(chatId, 'Please enter the buy max:');
 } else if (userStates[chatId] && userStates[chatId].awaitingBuyMax) {
   userStates[chatId].BUY_MAX = parseInt(text, 10);
   userStates[chatId].awaitingSellMax = true;
   bot.sendMessage(chatId, 'Please enter the sell max:');
 } else if (userStates[chatId] && userStates[chatId].awaitingSellMax) {
   userStates[chatId].SELL_MAX = parseInt(text, 10);
   userStates[chatId].awaitingMaxWallet = true;
   bot.sendMessage(chatId, 'Please enter the max wallet:');
 } else if (userStates[chatId] && userStates[chatId].awaitingMaxWallet) {
   userStates[chatId].MAX_WALLET = parseInt(text, 10);
   userStates[chatId].awaitingSwapTokensAt = true;
   bot.sendMessage(chatId, 'Please enter the swap tokens at:');
 } else if (userStates[chatId] && userStates[chatId].awaitingSwapTokensAt) {
   userStates[chatId].SWAP_TOKENS_AT = parseInt(text, 10);
   userStates[chatId].awaitingBuyOpFee = true;
   bot.sendMessage(chatId, 'Please enter the buy operation fee:');
 } else if (userStates[chatId] && userStates[chatId].awaitingBuyOpFee) {
   userStates[chatId].BUY_OP_FEE = parseInt(text, 10);
   userStates[chatId].awaitingBuyLiqFee = true;
   bot.sendMessage(chatId, 'Please enter the buy liquidity fee:');
 } else if (userStates[chatId] && userStates[chatId].awaitingBuyLiqFee) {
   userStates[chatId].BUY_LIQ_FEE = parseInt(text, 10);
   userStates[chatId].awaitingBuyTreasuryFee = true;
   bot.sendMessage(chatId, 'Please enter the buy treasury fee:');
 } else if (userStates[chatId] && userStates[chatId].awaitingBuyTreasuryFee) {
   userStates[chatId].BUY_TREASURY_FEE = parseInt(text, 10);
   userStates[chatId].awaitingSellOpFee = true;
   bot.sendMessage(chatId, 'Please enter the sell operation fee:');
 } else if (userStates[chatId] && userStates[chatId].awaitingSellOpFee) {
   userStates[chatId].SELL_OP_FEE = parseInt(text, 10);
   userStates[chatId].awaitingSellTreasuryFee = true;
   bot.sendMessage(chatId, 'Please enter the sell treasury fee:');
 } else if (userStates[chatId] && userStates[chatId].awaitingSellTreasuryFee) {
   userStates[chatId].SELL_TREASURY_FEE = parseInt(text, 10);
   userStates[chatId].awaitingSellLiqFee = true;
   bot.sendMessage(chatId, 'Please enter the sell liquidity fee:');
 } else if (userStates[chatId] && userStates[chatId].awaitingSellLiqFee) {
   userStates[chatId].SELL_LIQ_FEE = parseInt(text, 10);
   userStates[chatId].awaitingCAClockPer = true;
   bot.sendMessage(chatId, 'Please enter the CA clock per:');
 } else if (userStates[chatId] && userStates[chatId].awaitingCAClockPer) {
   userStates[chatId].CA_CLOCK_PER = parseInt(text, 10);
   userStates[chatId].awaitingOperatingAddress = true;
   bot.sendMessage(chatId, 'Please enter the operating address:');
 } else if (userStates[chatId] && userStates[chatId].awaitingOperatingAddress) {
   userStates[chatId].OPERATING_ADDRESS = text;
   userStates[chatId].awaitingTreasuryAddress = true;
   bot.sendMessage(chatId, 'Please enter the treasury address:');
 } else if (userStates[chatId] && userStates[chatId].awaitingTreasuryAddress) {
   userStates[chatId].TREASURY_ADDRESS = text;
   userStates[chatId].awaitingTreasuryAddress = false;

   
   const requestData = {
     user: userStates[chatId].user,
     network: userStates[chatId].network,
     tokenSymbol: userStates[chatId].tokenSymbol,
     tokenName: userStates[chatId].tokenName,
     contractName: userStates[chatId].contractName,
     ROUTER_ADDRESS: userStates[chatId].ROUTER_ADDRESS,
     OWNER: userStates[chatId].OWNER,
     TOTAL_SUPPLY: userStates[chatId].TOTAL_SUPPLY,
     BUY_MAX: userStates[chatId].BUY_MAX,
     SELL_MAX: userStates[chatId].SELL_MAX,
     MAX_WALLET: userStates[chatId].MAX_WALLET,
     SWAP_TOKENS_AT: userStates[chatId].SWAP_TOKENS_AT,
     BUY_OP_FEE: userStates[chatId].BUY_OP_FEE,
     BUY_LIQ_FEE: userStates[chatId].BUY_LIQ_FEE,
     BUY_TREASURY_FEE: userStates[chatId].BUY_TREASURY_FEE,
     SELL_OP_FEE: userStates[chatId].SELL_OP_FEE,
     SELL_TREASURY_FEE: userStates[chatId].SELL_TREASURY_FEE,
     SELL_LIQ_FEE: userStates[chatId].SELL_LIQ_FEE,
     CA_CLOCK_PER: userStates[chatId].CA_CLOCK_PER,
     OPERATING_ADDRESS: userStates[chatId].OPERATING_ADDRESS,
     TREASURY_ADDRESS: userStates[chatId].TREASURY_ADDRESS,
   };


   const existingUser = await RequestModel.findOne({ user: userStates[chatId].user, network: userStates[chatId].network });

   if (existingUser) {
     bot.sendMessage(chatId, 'User already exists. Data not saved.');
   } else {
     const request = new RequestModel(requestData);
     request.save((err) => {
       if (err) {
         bot.sendMessage(chatId, 'Error saving data.');
       } else {
         bot.sendMessage(chatId, 'Data saved successfully.');
       }
     });
   }

   delete userStates[chatId];
 }
});




























