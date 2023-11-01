const express = require('express');
const botRotues = express.Router();
const TelegramBot = require('node-telegram-bot-api');
const RequestModel = require('../models/requests');
const { CreateRequest, UpdateRequest, storeRequestData } = require('../controller/request');
const users = require('../models/users');
const { createUser } = require('../controller/user');
const { updatedCurrentField } = require('../utils/general');
const { estimateGas, deployStandardToken } = require('../controller/deploy');
// Define routes using the router
var uniqueid =[] ;

const replyText = "Once you send the enough gas to the wallet please reply to this specific message with your transaction hash. " ;
const privateReplytext = "Once you have the enough gas in the wallet please reply to this specific message with your private key. " ;
const verifyReplyText = 'Please reply to this specific message with the contract address you want to verify.' ; 
const {symbols, PROVIDER}  = require("../constants");
const { ethers } = require('ethers');
const { verify } = require('../controller/verify');



botRotues.get('/', async (req, res) => {

console.log("request received");

////////////////////////////////////////////bot/////////////////////////////////////////////

const token = process.env.TG_BOT_SECRET; 
const bot = new TelegramBot(token, { polling: true });
const userStates = {};


// Define a route

bot.onText(/\/verify/, async (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Please note that you can only verify your own contracts (deployed from your TG account)' );
  bot.sendMessage(chatId, verifyReplyText );
})

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    await createUser({username: msg.chat.username})
    if(!uniqueid.includes(chatId+msg.message_id)){
    const request = await CreateRequest({username: msg.chat.username})
    bot.sendMessage(chatId, 'Welcome to CA Deployer Bot! Please select a network to continue.' , {  "reply_markup": {
        "inline_keyboard": [         
            [
              {
                text: "Ethereum",
                callback_data: "network_1",

              },
              {
                text: "Arbitrum",
                callback_data: "network_42161",

              },
            ],
            [
              {
                text: "BSC Mainnet",
                callback_data: "network_56",

              },
              {
                text: "BSC Testnet",
                callback_data: "network_97",

              }
            ]              
        ]
    }, parse_mode: 'html' });

    userStates[chatId] = { awaitingNetwork: true };

    uniqueid.push(chatId+msg.message_id)
    }
   });


   bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
  
    const chatId = callbackQuery.message.chat.id ; 

    if(!uniqueid.includes(parseInt(callbackQuery.id)+callbackQuery.message.chat.id+callbackQuery.message.message_id)){
      uniqueid.push(parseInt(callbackQuery.id)+callbackQuery.message.chat.id+callbackQuery.message.message_id)

    if(callbackQuery.data.includes("network_")){
        // subscribe(callbackQuery.message)
        let network_data = callbackQuery.data  ;
        let networkId = network_data.replace("network_","");
        await UpdateRequest({username : callbackQuery.message.chat.username , bot: bot , updateData : {network: networkId}});
        sendContractNamemsg(callbackQuery.message.chat)
    }

    else if(callbackQuery.data.includes("router_")){
      // subscribe(callbackQuery.message)
      let router_data = callbackQuery.data  ;
      let router = router_data.replace("router_","");
      await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId, updateData : {ROUTER_ADDRESS: router}});      
  }

  else if(callbackQuery.data.includes("tax_")){
    // subscribe(callbackQuery.message)
    let tax_data = callbackQuery.data  ;
    let tax = tax_data.replace("tax_","");
    if(tax == "yes"){
      let data = {
        FEE: true
      }
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId , updateData : data});   
    await updatedCurrentField(callbackQuery.message.chat.username ,"BUY_OP_FEE")
    bot.sendMessage(chatId, 'Please enter buy operation fee percentage without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)');
    }
    else{
      let data = {
        FEE: false,
        BUY_OP_FEE: 0,
        BUY_LIQ_FEE: 0,
        BUY_TREASURY_FEE: 0,
        SELL_OP_FEE: 0,
        SELL_TREASURY_FEE: 0,
        SELL_LIQ_FEE: 0,
        OPERATING_ADDRESS: "0x0000000000000000000000000000000000000000",
        TREASURY_ADDRESS: "0x0000000000000000000000000000000000000000",
        
      };
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId, FEE : true  , updateData : data});   

    }
   }
   else if(callbackQuery.data.includes("trading_")){
    // subscribe(callbackQuery.message)
    let choice_data = callbackQuery.data  ;
    let choice = choice_data.replace("trading_","");
    if(choice == "yes"){
      let data = {
        TRADING: true,
      }

    await updatedCurrentField(callbackQuery.message.chat.username ,"TRADING_BLOCK_LIMIT")

    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId , updateData : data});   


    bot.sendMessage(chatId, 'Please enter the maximum number of block allowed for trading control');
    }
    else{
      let data = {
        TRADING: false,
        TRADING_BLOCK_LIMIT: 0,
         
        
      };
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId, TRADING : true  , updateData : data});   

    }
   }
   else if(callbackQuery.data.includes("transferlimit_")){
    // subscribe(callbackQuery.message)
    let choice_data = callbackQuery.data  ;
    let choice = choice_data.replace("transferlimit_","");
    if(choice == "yes"){
      let data = {
        TRANSFER_LIMIT: true,
      }
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, TRANSFER_LIMIT : true ,  chatId: chatId , updateData : data});   

 
    }
    else{
      let data = {
        TRANSFER_LIMIT: false, 
        BUY_LIMIT: 10000,
        SELL_LIMIT: 10000        
      };

    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId, TRANSFER_LIMITNO : true  , updateData : data});   

    }
   }
   else if(callbackQuery.data.includes("transferdelay")){
    // subscribe(callbackQuery.message)
    let choice_data = callbackQuery.data  ;
    let choice = choice_data.replace("transferdelay","");
    if(choice == "yes"){
      let data = {
        TRANSFERDELAY: true,
      }
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId ,  TRANSFERDELAY : true , updateData : data});   

 
    }
    else{
      let data = {
        TRANSFERDELAY: false, 
      };
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId, TRANSFERDELAY : true  , updateData : data});   

    }
   }else if(callbackQuery.data.includes("antisniper")){
    // subscribe(callbackQuery.message)
    let choice_data = callbackQuery.data  ;
    let choice = choice_data.replace("antisniper","");
    if(choice == "yes"){
      let data = {
        ANTISNIPER: true,
      }
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId ,ANTISNIPER : true,  updateData : data});   
    bot.sendMessage(chatId, 'Please enter the maximum number of block allowed for trading control');

    
    }
    else{
      let data = {
        ANTISNIPER: false, 
         
        
      };
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId, ANTISNIPERNO : true  , updateData : data});   

    }
   }
   else if(callbackQuery.data.includes("blacklist_")){
    // subscribe(callbackQuery.message)
    let choice_data = callbackQuery.data  ;
    let choice = choice_data.replace("blacklist_","");
    if(choice == "yes"){
      let data = {
        BLACKLIST: true,
      }
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId ,  BLACKLIST : true , updateData : data});   

 
    }
    else{
      let data = {
        BLACKLIST: false, 
         
        
      };
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId, BLACKLIST : true  , updateData : data});   

    }
   }

   else if(callbackQuery.data.includes("amm_")){
    // subscribe(callbackQuery.message)
    let choice_data = callbackQuery.data  ;
    let choice = choice_data.replace("amm_","");
    if(choice == "yes"){
      let data = {
        AMM: true,
      }
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId ,  AMM : true , updateData : data});   

 
    }
    else{
      let data = {
        AMM: false, 
         
        
      };
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId, AMMNO : true  , updateData : data});   
      
    }
   }

   
   else if(callbackQuery.data.includes("calock_")){
    // subscribe(callbackQuery.message)
    let choice_data = callbackQuery.data  ;
    let choice = choice_data.replace("calock_","");
    if(choice == "yes"){
      let data = {
        CA_CLOCK: true,
      }
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId ,  CA_CLOCK : true , updateData : data});   

 
    }
    else{
      let data = {
        CA_CLOCK: false, 
         
        
      };
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId, CA_CLOCK_NO : true  , updateData : data});   
      
    }
   }

   else if(callbackQuery.data.includes("message_")){
    // subscribe(callbackQuery.message)
    let choice_data = callbackQuery.data  ;
    let choice = choice_data.replace("message_","");
    if(choice == "yes"){
      let data = {
        MESSAGE: true,
      }
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId ,MESSAGE:true ,  updateData : data});   

 
    }
    else{
      let data = {
        MESSAGE: false, 
         
        
      };
    await UpdateRequest({username : callbackQuery.message.chat.username , network: null, bot: bot, chatId: chatId, MESSAGENO : true  , updateData : data});   
      
    }
   }   
   else if(callbackQuery.data.includes("confirm_")){
    let confirm_data = callbackQuery.data ; 
    let request_id = confirm_data.replace("confirm_","");
    
    bot.sendMessage(chatId, 'Confirmed!! Your request id is '+request_id+'\nPlease use this for any future references.')
    let user= await users.findOne({currentRequest : request_id});
    bot.sendMessage(chatId, 'Please choose the deploy method below. \n\n<b>METHOD 1:</b> You can deploy the contract using your custodial wallet with us. You need to send the estimated fee to your custodial wallet:\n\n'+user.walletAddress+"\n\n\n\n<b>METHOD 2:</b> You can also deploy with your own wallet with sufficient gas balance by sharing it's private key. (WE DON'T STORE IT, BUT IT MAY STAY IN THE TELEGRAM) \n\nPlease choose below." , {  "reply_markup": {
      "inline_keyboard": [         
          [
            {
              text: "METHOD 1",
              callback_data: "method1_"+request_id,

            },
            {
              text: "METHOD 2",
              callback_data:  "method2_"+request_id,

            },
          ]            
      ]
  }, parse_mode: 'html' });
   }

   else if(callbackQuery.data.includes("method")){
    let method_data = callbackQuery.data ; 
    let method = 1 ; 
    let request_id = method_data.replace("method1_","")
    if(callbackQuery.data.includes("method2")){
      method = 2 ;
     request_id = method_data.replace("method2_","")
    }
 
    let _tempmsgId =  await bot.sendMessage(chatId, 'Please wait... we are estimating the gas fee.');

    const username = callbackQuery.message.chat.username ; 

    const requestDetail = await RequestModel.findOne({_id: request_id});

    const userDetail = await users.findOne({username: username});
   
    const estimateFee = await estimateGas({data: requestDetail})
    bot.deleteMessage(chatId,_tempmsgId.message_id); 

    if(estimateFee){

    bot.sendMessage(chatId, 'Your estimated gas is '+estimateFee+symbols[requestDetail.network]);
    
    if(method == 1){
     
    bot.sendMessage(chatId, 'Please send the enough gas to the below wallet.');
    bot.sendMessage(chatId, userDetail.walletAddress);
    bot.sendMessage(chatId,  replyText+request_id);
  }
  else if (method ==  2){
    bot.sendMessage(chatId, 'Please send the enough gas to the below wallet.');

    bot.sendMessage(chatId, privateReplytext+request_id);
  }
}else {
  bot.sendMessage(chatId, 'Estimation failed!');
  bot.sendMessage(chatId, 'Please retry or start a new contract if issue still persists');
  
}
   }
   

   else if(callbackQuery.data.includes("redeploy_")){
    let request_data = callbackQuery.data ; 
    let request_id = request_data.replace("redeploy_","")
    let _tmsgid = await bot.sendMessage(chatId, "Please wait... We are initiating the re-deployment.");
    const requestDetail = await RequestModel.findOne({_id: request_id});

    if(requestDetail){
    if(requestDetail.txnHash){
    if(requestDetail.deployTxnHash && requestDetail.contractAddress){
    bot.deleteMessage(chatId,_tmsgid.message_id)
      bot.sendMessage(chatId,`Deployment details found.` );  
      bot.sendMessage(chatId,`Deployment Transaction Hash: ${requestDetail.deployTxnHash}` ); 
      bot.sendMessage(chatId,`Contract: ${requestDetail.contractAddress}` );  
    }
    else{
      try{

      const {txnHash , data} = await deployStandardToken({data: requestDetail})
    bot.deleteMessage(chatId,_tmsgid.message_id)
      
      if(txnHash == 0){
        bot.sendMessage(chatId,`ERROR: ${data}` ); 
      }
      else{
        bot.sendMessage(chatId,`Deployment successful.` ); 
        bot.sendMessage(chatId,`Deployment Transaction Hash: ${txnHash}` ); 
        bot.sendMessage(chatId,`Contract: ${data}` );   
      }
    }
    catch(e){
    bot.deleteMessage(chatId,_tmsgid.message_id)
      bot.sendMessage(chatId,`Deployment failed.` ); 

      // console.log();
    }
  }

      
      
    } 
    else{ 
    bot.deleteMessage(chatId,_tmsgid.message_id)

      bot.sendMessage(chatId,`Txn hash not found` );   
  
    }
  }
  else{ 
    bot.deleteMessage(chatId,_tmsgid.message_id)
    bot.sendMessage(chatId,`Request not found` );   

  }

   }



  }

  });



async function sendContractNamemsg(chat) {
  try{
    await updatedCurrentField(chat.username,"TOKEN_NAME");
    bot.sendMessage(chat.id, 'Please enter Token Name.');
  }
  catch(e){
    console.log(e);
  }
  }


  
  


   bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    // console.log(text);
    try{
    if(!uniqueid.includes(chatId+msg.message_id) && text !== "/start" && text !== "/verify"){
      uniqueid.push(chatId+msg.message_id);
      if (msg.reply_to_message && (msg.reply_to_message.text.includes(replyText) || msg.reply_to_message.text.includes(privateReplytext) || msg.reply_to_message.text.includes(verifyReplyText)  )) {
         
          if(msg.reply_to_message.text.includes(replyText)){
        let request_id = msg.reply_to_message.text.replace(replyText,"");

            let _tmsgid = await bot.sendMessage(chatId, "Please wait... We are confirming the payment transaction hash.");
            let txnHash = msg.text ;  
 
            const checkrequestDetail = await RequestModel.findOne({txnHash : txnHash });

            if(checkrequestDetail){
               bot.deleteMessage(chatId,_tmsgid.message_id)

              bot.sendMessage(chatId,`Payment Transaction hash already exist.`);
              if(checkrequestDetail._id == request_id){
              if(checkrequestDetail.deployTxnHash && checkrequestDetail.contractAddress){
                 bot.sendMessage(chatId,`Deployment details:\n\nTxn: ${checkrequestDetail.deployTxnHash}\nContract: ${checkrequestDetail.contractAddress}`);
              }
              else{
                bot.sendMessage(chatId,`If the deployment was unsuccessful. Please use the button below to re-deploy.`,
                {  "reply_markup": {
                  "inline_keyboard": [         
                      [
                        {
                          text: "Re-Deploy",
                          callback_data: "redeploy_"+request_id,
            
                        }
                      ]            
                  ]
              }, parse_mode: 'html' })
              }
              return;
            }
          }
            const requestDetail = await RequestModel.findOne({_id: request_id });
            if(requestDetail){

              if(requestDetail.txnHash){
            bot.deleteMessage(chatId,_tmsgid.message_id)

                bot.sendMessage(chatId,'Request already has a Payment Transaction hash attached. Please use re-deploy if deployment was unsuccessful.',
                {  "reply_markup": {
                  "inline_keyboard": [         
                      [
                        {
                          text: "Re-Deploy",
                          callback_data: "redeploy_"+request_id,
            
                        }
                      ]            
                  ]
              }, parse_mode: 'html' });
              }
              else{

                const userDetail = await users.findOne({username: msg.chat.username});
                const estimateFee = await estimateGas({data: requestDetail})
                bot.deleteMessage(chatId,_tmsgid.message_id)
                if(estimateFee){
            
                  let _provider =  new ethers.JsonRpcProvider(PROVIDER[requestDetail.network]) ;  // default is 56

                   
                   // Get the transaction details
                   _provider.getTransaction(txnHash)
                  .then(async (transaction) => { 
                    if (transaction) {
                    bot.sendMessage(chatId,`Payment Transaction Hash: ${transaction.hash}`);
                    if(userDetail.walletAddress != transaction.to){
                    bot.sendMessage(chatId,`Receipient is not the shared walet.`);
                    return;
                    }
                    if(estimateFee > ethers.formatUnits(transaction.value, 'ether')){
                      bot.sendMessage(chatId,`Sent value is less than estimated fee, which ${estimateFee} ${symbols[requestDetail.network]}` );
                      return;
                    }
                    bot.sendMessage(chatId,`Deployment started.` ); 
                    
                    await RequestModel.findOneAndUpdate(
                    { _id: requestDetail },
                    { $set: {
                        txnHash :  transaction.hash
                    } },
                    { new: true } 
                    ); 
      
                  const {txnHash , data} = await deployStandardToken({data: requestDetail})
                 
      
                  if(txnHash == 0){
                    bot.sendMessage(chatId,`ERROR: ${data}` ); 
                  }
                  else{
                       
                
      
                    bot.sendMessage(chatId,`Deployment successful.` ); 
                    bot.sendMessage(chatId,`Deployment Transaction Hash: ${txnHash}` ); 
                    bot.sendMessage(chatId,`Contract: ${data}` );   
                  }
      
                  } else { 
                    bot.sendMessage(chatId,'Payment Transaction not found.');
                  }
                })
                .catch((error) => {
                  console.log(error);
                  bot.sendMessage(chatId,'Payment Transaction hash not valid.');
                });
                }
                else {
                  bot.sendMessage(chatId, 'Estimation failed!');
                  bot.sendMessage(chatId, 'Please retry or start a new contract if issue still persists');
                  
                }
                
              }
          }
          else{
            bot.deleteMessage(chatId,_tmsgid.message_id)
            bot.sendMessage(chatId,'Request not found');

          }
        }
        else if(msg.reply_to_message.text.includes(privateReplytext)){
          let request_id = msg.reply_to_message.text.replace(privateReplytext,"");
  
              let _tmsgid = await bot.sendMessage(chatId, "Please wait... We are confirming the private key.");
              let private_key = msg.text ;  
    
              const requestDetail = await RequestModel.findOne({_id: request_id });
              if(requestDetail){
  
                bot.deleteMessage(chatId,_tmsgid.message_id)
                
                if(requestDetail.deployTxnHash && requestDetail.contractAddress){
                  bot.sendMessage(chatId, "Deployment details found for this request.");

                  bot.sendMessage(chatId,`Deployment details:\n\nTxn: ${requestDetail.deployTxnHash}\nContract: ${requestDetail.contractAddress}`);
                  return;
               }
      
                  let _provider =  new ethers.JsonRpcProvider(PROVIDER[requestDetail.network]) ;  // default is 56
                  
                   // Get the transaction details
                   
                  const wallet = new ethers.Wallet(private_key, _provider);

                  if(wallet){
                    bot.sendMessage(chatId,`Deployment started.` ); 
                    bot.sendMessage(chatId,`Wallet: ${wallet.address}` ); 
                    
                     
      
                  const {txnHash , data} = await deployStandardToken({data: requestDetail, private_key})
                     
                   
                 
      
                  if(txnHash == 0){
                    bot.sendMessage(chatId,`ERROR: ${data}` ); 
                  }
                  else{
                       
                  await RequestModel.findOneAndUpdate(
                    { _id: requestDetail },
                    { $set: {
                        txnHash :  0
                    } },
                    { new: true } 
                ); 
                    
                    bot.sendMessage(chatId,`Deployment successful.` ); 
                    bot.sendMessage(chatId,`Deployment Transaction Hash: ${txnHash}` ); 
                    bot.sendMessage(chatId,`Contract: ${data}` );   
                  }
      
                  } else { 
                    bot.sendMessage(chatId,'Wallet not found.');
                  }
               
                
          
          
          }
          else{
            bot.deleteMessage(chatId,_tmsgid.message_id)
            bot.sendMessage(chatId,'Request not found.');

          }
        }
        else if(msg.reply_to_message.text.includes(verifyReplyText)){

          const _verify = await verify(msg.chat.username,text);
          // console.log(_verify);
          if(_verify.result){
            if(_verify.data.status == "1"){
              bot.sendMessage(chatId, "Verification request successful!")
              bot.sendMessage(chatId, `URL: ${_verify.CONTRACT_URL}`)
            }
            else{

              bot.sendMessage(chatId, `${_verify.data.result}`)

            }
            
          }
          else{
            bot.sendMessage(chatId, "Verification request failed!")
            bot.sendMessage(chatId, _verify.data)
            

          }
        }
      }
      else{
        await storeRequestData({username: msg.chat.username , text: text, chatId: chatId, bot})
      }
    }
  }
  catch(e){
    console.log("e"+e);
  }
  })

   
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