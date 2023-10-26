const express = require('express');
const botRotues = express.Router();
const TelegramBot = require('node-telegram-bot-api');
const RequestModel = require('../models/requests');
const { CreateRequest } = require('../controller/request');
// Define routes using the router
var uniqueid =[] ;

botRotues.get('/', async (req, res) => {

console.log("request received");

////////////////////////////////////////////bot/////////////////////////////////////////////

const token = process.env.TG_BOT_SECRET; 
const bot = new TelegramBot(token, { polling: true });
const userStates = {};


// Define a route
    
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    if(!uniqueid.includes(chatId+msg.message_id)){
    const request = await CreateRequest({username: msg.chat.username})
    bot.sendMessage(chatId, 'Welcome to CA Deployer Bot! Please select a network (example: 97) to continue.' , {  "reply_markup": {
        "inline_keyboard": [         
            [
              {
                text: "BSC Testnet",
                callback_data: "network_97/"+request.request_id,

              },
              {
                text: "BSC Mainnet",
                callback_data: "network_56/"+request.request_id,

              },
            ]            
        ]
    }, parse_mode: 'html' });

    userStates[chatId] = { awaitingNetwork: true };

    uniqueid.push(chatId+msg.message_id)
    }
   });


   bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  
    const chatId = callbackQuery.message.chat.id ; 

    if(!uniqueid.includes(parseInt(callbackQuery.id)+callbackQuery.message.chat.id+callbackQuery.message.message_id)){
    if(callbackQuery.data.includes("network_")){
        // subscribe(callbackQuery.message)
        let network_data = callbackQuery.data  ;
        network_data  = network_data.split("/");
        let networkId = network_data[0].replace("network_","");
        let requestId = network_data[1] ; 
      bot.sendMessage(chatId, 'Your network id: '+networkId);
      bot.sendMessage(chatId, 'Your request id: '+requestId);

    }
    uniqueid.push(parseInt(callbackQuery.id)+callbackQuery.message.chat.id+callbackQuery.message.message_id)
  }

  });
   
//    bot.on('message', async (msg) => {
//     if(!uniqueid.includes(chatId+msg.message_id)){

//     const chatId = msg.chat.id;
//     const text = msg.text;
   
//     if (userStates[chatId] && userStates[chatId].awaitingNetwork) {
//       userStates[chatId].network = parseInt(text, 10);
//       userStates[chatId].awaitingNetwork = false;
//       bot.sendMessage(chatId, 'Please enter the user value:');
//     } else if (userStates[chatId] && !userStates[chatId].awaitingNetwork) {
//       userStates[chatId].user = text;
//       userStates[chatId].awaitingTokenSymbol = true;
//       bot.sendMessage(chatId, 'Please enter the token symbol:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingTokenSymbol) {
//       userStates[chatId].tokenSymbol = text;
//       userStates[chatId].awaitingTokenName = true;
//       bot.sendMessage(chatId, 'Please enter the token name:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingTokenName) {
//       userStates[chatId].tokenName = text;
//       userStates[chatId].awaitingContractName = true;
//       bot.sendMessage(chatId, 'Please enter the contract name:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingContractName) {
//       userStates[chatId].contractName = text;
//       userStates[chatId].awaitingRouterAddress = true;
//       bot.sendMessage(chatId, 'Please enter the router address:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingRouterAddress) {
//       userStates[chatId].ROUTER_ADDRESS = text;
//       userStates[chatId].awaitingOwner = true;
//       bot.sendMessage(chatId, 'Please enter the owner address:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingOwner) {
//       userStates[chatId].OWNER = text;
//       userStates[chatId].awaitingTotalSupply = true;
//       bot.sendMessage(chatId, 'Please enter the total supply:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingTotalSupply) {
//       userStates[chatId].TOTAL_SUPPLY = parseInt(text, 10);
//       userStates[chatId].awaitingBuyMax = true;
//       bot.sendMessage(chatId, 'Please enter the buy max:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingBuyMax) {
//       userStates[chatId].BUY_MAX = parseInt(text, 10);
//       userStates[chatId].awaitingSellMax = true;
//       bot.sendMessage(chatId, 'Please enter the sell max:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingSellMax) {
//       userStates[chatId].SELL_MAX = parseInt(text, 10);
//       userStates[chatId].awaitingMaxWallet = true;
//       bot.sendMessage(chatId, 'Please enter the max wallet:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingMaxWallet) {
//       userStates[chatId].MAX_WALLET = parseInt(text, 10);
//       userStates[chatId].awaitingSwapTokensAt = true;
//       bot.sendMessage(chatId, 'Please enter the swap tokens at:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingSwapTokensAt) {
//       userStates[chatId].SWAP_TOKENS_AT = parseInt(text, 10);
//       userStates[chatId].awaitingBuyOpFee = true;
//       bot.sendMessage(chatId, 'Please enter the buy operation fee:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingBuyOpFee) {
//       userStates[chatId].BUY_OP_FEE = parseInt(text, 10);
//       userStates[chatId].awaitingBuyLiqFee = true;
//       bot.sendMessage(chatId, 'Please enter the buy liquidity fee:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingBuyLiqFee) {
//       userStates[chatId].BUY_LIQ_FEE = parseInt(text, 10);
//       userStates[chatId].awaitingBuyTreasuryFee = true;
//       bot.sendMessage(chatId, 'Please enter the buy treasury fee:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingBuyTreasuryFee) {
//       userStates[chatId].BUY_TREASURY_FEE = parseInt(text, 10);
//       userStates[chatId].awaitingSellOpFee = true;
//       bot.sendMessage(chatId, 'Please enter the sell operation fee:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingSellOpFee) {
//       userStates[chatId].SELL_OP_FEE = parseInt(text, 10);
//       userStates[chatId].awaitingSellTreasuryFee = true;
//       bot.sendMessage(chatId, 'Please enter the sell treasury fee:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingSellTreasuryFee) {
//       userStates[chatId].SELL_TREASURY_FEE = parseInt(text, 10);
//       userStates[chatId].awaitingSellLiqFee = true;
//       bot.sendMessage(chatId, 'Please enter the sell liquidity fee:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingSellLiqFee) {
//       userStates[chatId].SELL_LIQ_FEE = parseInt(text, 10);
//       userStates[chatId].awaitingCAClockPer = true;
//       bot.sendMessage(chatId, 'Please enter the CA clock per:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingCAClockPer) {
//       userStates[chatId].CA_CLOCK_PER = parseInt(text, 10);
//       userStates[chatId].awaitingOperatingAddress = true;
//       bot.sendMessage(chatId, 'Please enter the operating address:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingOperatingAddress) {
//       userStates[chatId].OPERATING_ADDRESS = text;
//       userStates[chatId].awaitingTreasuryAddress = true;
//       bot.sendMessage(chatId, 'Please enter the treasury address:');
//     } else if (userStates[chatId] && userStates[chatId].awaitingTreasuryAddress) {
//       userStates[chatId].TREASURY_ADDRESS = text;
//       userStates[chatId].awaitingTreasuryAddress = false;
   
   
//       const requestData = {
//         user: userStates[chatId].user,
//         network: userStates[chatId].network,
//         tokenSymbol: userStates[chatId].tokenSymbol,
//         tokenName: userStates[chatId].tokenName,
//         contractName: userStates[chatId].contractName,
//         ROUTER_ADDRESS: userStates[chatId].ROUTER_ADDRESS,
//         OWNER: userStates[chatId].OWNER,
//         TOTAL_SUPPLY: userStates[chatId].TOTAL_SUPPLY,
//         BUY_MAX: userStates[chatId].BUY_MAX,
//         SELL_MAX: userStates[chatId].SELL_MAX,
//         MAX_WALLET: userStates[chatId].MAX_WALLET,
//         SWAP_TOKENS_AT: userStates[chatId].SWAP_TOKENS_AT,
//         BUY_OP_FEE: userStates[chatId].BUY_OP_FEE,
//         BUY_LIQ_FEE: userStates[chatId].BUY_LIQ_FEE,
//         BUY_TREASURY_FEE: userStates[chatId].BUY_TREASURY_FEE,
//         SELL_OP_FEE: userStates[chatId].SELL_OP_FEE,
//         SELL_TREASURY_FEE: userStates[chatId].SELL_TREASURY_FEE,
//         SELL_LIQ_FEE: userStates[chatId].SELL_LIQ_FEE,
//         CA_CLOCK_PER: userStates[chatId].CA_CLOCK_PER,
//         OPERATING_ADDRESS: userStates[chatId].OPERATING_ADDRESS,
//         TREASURY_ADDRESS: userStates[chatId].TREASURY_ADDRESS,
//       };
   
   
//       const existingUser = await RequestModel.findOne({ user: userStates[chatId].user, network: userStates[chatId].network });
   
//       if (existingUser) {
//         bot.sendMessage(chatId, 'User already exists. Data not saved.');
//       } else {
//         const request = new RequestModel(requestData);
//         request.save((err) => {
//           if (err) {
//             bot.sendMessage(chatId, 'Error saving data.');
//           } else {
//             bot.sendMessage(chatId, 'Data saved successfully.');
//           }
//         });
//       }
   
//       delete userStates[chatId];
//     }

//     uniqueid.push(chatId+msg.message_id)
// }
//    });


});
 

module.exports = botRotues; // Export the router