const { ObjectId } = require('mongodb');
const requestModel = require('../models/requests'); 
const users = require('../models/users');
const { createUser } = require('./user');
const { updatedCurrentField } = require('../utils/general');
const RequestModel = require('../models/requests');
const { UNISWAP_ROUTER, PANCAKE_ROUTER } = require('../constants');

const nextField = {
    network: "TOKEN_NAME",
    TOKEN_NAME: "TOKEN_SYMBOL",
    TOKEN_SYMBOL: "OWNER",
    OWNER: "TOTAL_SUPPLY",
    TOTAL_SUPPLY: "FEE",
    FEE : "BUY_OP_FEE",
    BUY_OP_FEE: "BUY_TREASURY_FEE",
    BUY_TREASURY_FEE: "SELL_OP_FEE",
    SELL_OP_FEE: "SELL_TREASURY_FEE",
    SELL_TREASURY_FEE: "BUY_MAX",
    BUY_MAX: "SELL_MAX",
    SELL_MAX: "OPERATING_ADDRESS",
    OPERATING_ADDRESS: "TREASURY_ADDRESS",
    TREASURY_ADDRESS: "TRADING", 
    TRADING : "TRADING_BLOCK_LIMIT",
    TRADING_BLOCK_LIMIT : "TRANSFER_LIMIT",
    TRANSFER_LIMIT: "MAX_WALLET",   
    MAX_WALLET: "SELL_LIMIT",
    SELL_LIMIT: "BUY_LIMIT",
    BUY_LIMIT: "TRANSFERDELAY",
    TRANSFERDELAY: "ANTISNIPER",
    ANTISNIPER : "SNIPING_BLOCK_LIMIT",
    SNIPING_BLOCK_LIMIT :  "BLACKLIST",
    BLACKLIST: "AMM",
    AMM: "ROUTER_ADDRESS",
    ROUTER_ADDRESS: "BUY_LIQ_FEE",
    BUY_LIQ_FEE: "SELL_LIQ_FEE",  
    SELL_LIQ_FEE: "SWAP_TOKENS_AT",
    SWAP_TOKENS_AT: "CA_CLOCK", 
    CA_CLOCK : "CA_CLOCK_PER", 
    CA_CLOCK_PER : "MESSAGE",
    MESSAGE : "MESSAGE_TEXT",
    MESSAGE_TEXT : "FINAL",
    FINAL : "FINAL"

}


const nextMsg = {
    network: "Please enter Token Name",
    TOKEN_NAME: "Please enter Token Symbol",
    TOKEN_SYMBOL: "Please enter Token Owner address",
    OWNER: "Please enter Token Supply",
    TOTAL_SUPPLY: "FEE",
    FEE : "Please enter buy operation fee percentage without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    BUY_OP_FEE: "Please enter buy treasury fee percentage without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    BUY_TREASURY_FEE: "Please enter sell operation fee percentage without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    SELL_OP_FEE: "Please enter sell treasury fee percentage without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    SELL_TREASURY_FEE: "Please enter max buy fee percentage of supply without % that can be ever set (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    BUY_MAX: "Please enter max sell fee percentage of supply without % that can be ever set (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    SELL_MAX: "Please enter operating fee address",
    OPERATING_ADDRESS: "Please enter treasury fee address",
    TREASURY_ADDRESS: "TRADING",
    TRADING : "Please enter the maximum number of block allowed for trading control",
    TRADING_BLOCK_LIMIT: "TRANSFER_LIMIT",
    TRANSFER_LIMIT: "Please enter max wallet limit percentage of supply without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)" ,
    MAX_WALLET: "Please enter max sell limit percentage of supply that can be set by owner without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    SELL_LIMIT: "Please enter max buy limit percentage of supply that can be set by owner without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    BUY_LIMIT: "TRANSFERDELAY" , 
    TRANSFERDELAY: "ANTISNIPER",
    ANTISNIPER: "SNIPING_BLOCK_LIMIT",
    SNIPING_BLOCK_LIMIT :  "BLACKLIST",
    BLACKLIST: "AMM" ,
    AMM: "ROUTER_ADDRESS" , 
    ROUTER_ADDRESS: "Please enter buy liquiidty fee percentage without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    BUY_LIQ_FEE: "Please enter sell liquiidty fee percentage without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    SELL_LIQ_FEE: "Please enter minimum amount percentage of supply that needs be hold by token contract to make liquidity without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    SWAP_TOKENS_AT: "CA_CLOCK",
    CA_CLOCK : "Please enter initial CA lock percentage for liquidity sell without % (Please enter whole numbers only)",
    CA_CLOCK_PER: "MESSAGE",
    MESSAGE : "Please enter any message that you want to add at the beginning of the token contract.",
    MESSAGE_TEXT: "FINAL",
    FINAL: "FINAL"
}

const netwrokName = {
    [56] : "BSC Mainnet",
    [97] : "BSC Testnet",
    [1] : "Ethereum",
    [42161] : "Arbitrum"
}


const routerMarkup = {
    [97] : {  "reply_markup": {
        "inline_keyboard": [         
            [
              {
                text: "PancakeSwap",
                callback_data: "router_"+PANCAKE_ROUTER[97],

              }
            ]            
        ]
    }, parse_mode: 'html' },
    [56] : {  "reply_markup": {
        "inline_keyboard": [         
            [
              {
                text: "PancakeSwap",
                callback_data: "router_"+PANCAKE_ROUTER[56],

              },
              {
                text: "Uniswap",
                callback_data: "router_"+UNISWAP_ROUTER[56],

              },
            ]            
        ]
    }, parse_mode: 'html' },
    [1] : {  "reply_markup": {
        "inline_keyboard": [         
            [
              {
                text: "PancakeSwap",
                callback_data: "router_"+PANCAKE_ROUTER[1],

              },
              {
                text: "Uniswap",
                callback_data: "router_"+UNISWAP_ROUTER[1],

              },
            ]            
        ]
    }, parse_mode: 'html' },
    [42161] : {  "reply_markup": {
        "inline_keyboard": [         
            [
              {
                text: "PancakeSwap",
                callback_data: "router_"+PANCAKE_ROUTER[42161],

              },
              {
                text: "Uniswap",
                callback_data: "router_"+UNISWAP_ROUTER[42161],

              },
            ]            
        ]
    }, parse_mode: 'html' }
}

// create request:
exports.CreateRequest = async (data) => {
    try {
        // const check = await requestModel.findOne({ user: data.username });

        // if (check) {
        //     console.log(`User already exists with request _id: ${check._id}`);
        //     return { result: 1, request_id: check._id };
        // } else {
            let newRequest = new requestModel({ USER: data.username });
            await newRequest.save(); 

            const updateUser = await users.findOneAndUpdate(
                { username: data.username },
                { $set: {
                    currentRequest :  newRequest._id,
                    currentField :  "network"
                } },
                { new: true } 
            );
            
            console.log(`Request generated with request _id: ${newRequest._id}`);
            console.log(`Request updated for user`);

            return { result: 1, request_id: newRequest._id , userUpdate: updateUser };
        // }
    } catch (error) {
        console.error(error); 
        return { result: 0 };
    }
}


exports.UpdateRequest = async (data) => {
    try {
        const {username, ...updateData } = data;
        const check = await users.findOne({ username: username , currentRequest : { $ne : null } });

        if (!check) {
            console.log(`User doesn't contain request Id`);
            return { result: 0 };
        } else {
        if ('USER' in updateData.updateData) {
            return { result: 0, message: 'Username cannot be updated' };
        }

       
        

        const request_id = check.currentRequest ;

        // console.log(updateData);
        const updatedRequest = await requestModel.findOneAndUpdate(
            { _id: request_id },
            { $set: updateData.updateData },
            { new: true } 
        );

        if (!updatedRequest) {
            return { result: 0, message: 'Request not found for update' };
        }

        if ('ROUTER_ADDRESS' in updateData.updateData) {
            await updatedCurrentField(username,nextField['ROUTER_ADDRESS']);
            sendNextMsg(data.bot,data.chatId,nextMsg['ROUTER_ADDRESS'],data.network,request_id);
        }

        if (data.FEE) { 
            await updatedCurrentField(username,nextField['TREASURY_ADDRESS']);
            sendNextMsg(data.bot,data.chatId,nextMsg['TREASURY_ADDRESS'],data.network,request_id);
        }

        if (data.TRADING) { 
          await updatedCurrentField(username,nextField['TRADING_BLOCK_LIMIT']);
          sendNextMsg(data.bot,data.chatId,nextMsg['TRADING_BLOCK_LIMIT'],data.network,request_id);

 
      }
      if (data.TRANSFER_LIMIT) { 
        await updatedCurrentField(username,nextField['TRANSFER_LIMIT']);
        sendNextMsg(data.bot,data.chatId,nextMsg['TRANSFER_LIMIT'],data.network,request_id);
      }else if(data.TRANSFER_LIMITNO){
        await updatedCurrentField(username,nextField['BUY_LIMIT']);
    sendNextMsg(data.bot,data.chatId,nextMsg['BUY_LIMIT'],data.network,request_id);

       
    }

    if(data.MESSAGE) {
      await updatedCurrentField(username,nextField['MESSAGE']);
      sendNextMsg(data.bot,data.chatId,nextMsg['MESSAGE'],data.network,request_id);
    }
    else if (data.MESSAGENO){
      await updatedCurrentField(username,nextField['MESSAGE_TEXT']);
      sendNextMsg(data.bot,data.chatId,nextMsg['MESSAGE_TEXT'],data.network,request_id);
    }


    if (data.ANTISNIPER) { 
      await updatedCurrentField(username,nextField['ANTISNIPER']);
     
  }

  if (data.ANTISNIPERNO) { 
    await updatedCurrentField(username,nextField['SNIPING_BLOCK_LIMIT']);
    sendNextMsg(data.bot,data.chatId,nextMsg['SNIPING_BLOCK_LIMIT'],data.network,request_id);

   
}
    
    
    if (data.TRANSFERDELAY) { 
      await updatedCurrentField(username,nextField['TRANSFERDELAY']);
      sendNextMsg(data.bot,data.chatId,nextMsg['TRANSFERDELAY'],data.network,request_id);
     
  }
  
  if (data.BLACKLIST) { 
    await updatedCurrentField(username,nextField['BLACKLIST']);
    sendNextMsg(data.bot,data.chatId,nextMsg['BLACKLIST'],data.network,request_id);
   
}
 



if (data.AMM) { 
  await updatedCurrentField(username,nextField['AMM']);
  sendNextMsg(data.bot,data.chatId,nextMsg['AMM'],data.network,request_id);
 
}

if (data.AMMNO) { 
  await updatedCurrentField(username,nextField['SWAP_TOKENS_AT']);
  sendNextMsg(data.bot,data.chatId,nextMsg['SWAP_TOKENS_AT'],data.network,request_id);
 
}

if (data.CA_CLOCK) { 
  await updatedCurrentField(username,nextField['CA_CLOCK']);
  sendNextMsg(data.bot,data.chatId,nextMsg['CA_CLOCK'],data.network,request_id);
 
}

if (data.CA_CLOCK_NO) { 
  await updatedCurrentField(username,nextField['CA_CLOCK_PER']);
  sendNextMsg(data.bot,data.chatId,nextMsg['CA_CLOCK_PER'],data.network,request_id);
 
}


        console.log(`Request with request_id ${request_id} updated successfully`);
        return { result: 1, updatedRequest };
    }
    } catch (error) {
        console.error(error);
        return { result: 0, message: 'Internal server error' };
    }
};


exports.storeRequestData = async(data) => {
    
        const username = data.username ; 
        const text = data.text ; 
        const check = await users.findOne({ username: username , currentRequest : { $ne : null }, currentField : { $ne : null }});

        if (!check) {
            console.log(`User doesn't contain request Id or field`);
            return { result: 0 };
        } else {
        const request_id = check.currentRequest ;

            const request = await RequestModel.findOne({ _id: request_id});            
            const field = check.currentField ;
            const updateData = {
                [field] : text 
            };  
            console.log(`User request data updated`);
            await this.UpdateRequest({username : username , updateData : updateData})
           
            await updatedCurrentField(username,nextField[check.currentField]);
            sendNextMsg(data.bot,data.chatId,nextMsg[check.currentField],request.network,request_id,username)

        }

         
}

async function sendNextMsg(bot,chatId,msg,network,requestId){
    try{
        if(msg == "ROUTER_ADDRESS"){
      
            bot.sendMessage(chatId, "Please choose a router for the token liquidity" , routerMarkup[network]);            
        } 
        
        else if(msg == "TRADING"){      

          bot.sendMessage(chatId, "Do you want to add trading control to your token ?" , {  "reply_markup": {
            "inline_keyboard": [         
                [
                  {
                    text: "Yes",
                    callback_data: "trading_yes",
    
                  },
                  {
                    text: "No",
                    callback_data: "trading_no",
    
                  },
                ]            
            ]
        }, parse_mode: 'html' } );          
        
        }
        else if(msg == "TRANSFER_LIMIT"){      

          bot.sendMessage(chatId, "Do you want to add transfer and holding limit to your token ?" , {  "reply_markup": {
            "inline_keyboard": [         
                [
                  {
                    text: "Yes",
                    callback_data: "transferlimit_yes",
    
                  },
                  {
                    text: "No",
                    callback_data: "transferlimit_no",
    
                  },
                ]            
            ]
        }, parse_mode: 'html' } );          
        
        }
        else if(msg == "TRANSFERDELAY"){      

          bot.sendMessage(chatId, "Do you want to add transfer delay to your token ?" , {  "reply_markup": {
            "inline_keyboard": [         
                [
                  {
                    text: "Yes",
                    callback_data: "transferdelay_yes",
    
                  },
                  {
                    text: "No",
                    callback_data: "transferdelay_no",
    
                  },
                ]            
            ]
        }, parse_mode: 'html' } );          
        
        }
        else if(msg == "ANTISNIPER"){      

          bot.sendMessage(chatId, "Do you want to add anti-sniper functions to your token ?" , {  "reply_markup": {
            "inline_keyboard": [         
                [
                  {
                    text: "Yes",
                    callback_data: "antisniper_yes",
    
                  },
                  {
                    text: "No",
                    callback_data: "antisniper_no",
    
                  },
                ]            
            ]
        }, parse_mode: 'html' } );          
        
        }
        else if(msg == "BLACKLIST"){      

          bot.sendMessage(chatId, "Do you want to add blacklist functions to your token ?" , {  "reply_markup": {
            "inline_keyboard": [         
                [
                  {
                    text: "Yes",
                    callback_data: "blacklist_yes",
    
                  },
                  {
                    text: "No",
                    callback_data: "blacklist_no",
    
                  },
                ]            
            ]
        }, parse_mode: 'html' } );          
        
        }
        else if(msg == "AMM"){      

          bot.sendMessage(chatId, "Do you want to make it an AMM token ?" , {  "reply_markup": {
            "inline_keyboard": [         
                [
                  {
                    text: "Yes",
                    callback_data: "amm_yes",
    
                  },
                  {
                    text: "No",
                    callback_data: "amm_no",
    
                  },
                ]            
            ]
        }, parse_mode: 'html' } );          
        
        }

        else if(msg == "FEE"){      
            bot.sendMessage(chatId, "Do you want to add fees to your token ?" , {  "reply_markup": {
                "inline_keyboard": [         
                    [
                      {
                        text: "Yes",
                        callback_data: "tax_yes",
        
                      },
                      {
                        text: "No",
                        callback_data: "tax_no",
        
                      },
                    ]            
                ]
            }, parse_mode: 'html' } );            
        }

        else if(msg == "CA_CLOCK"){      
          bot.sendMessage(chatId, "Do you want to add CA locked to your token ?" , {  "reply_markup": {
              "inline_keyboard": [         
                  [
                    {
                      text: "Yes",
                      callback_data: "calock_yes",
      
                    },
                    {
                      text: "No",
                      callback_data: "calock_no",
      
                    },
                  ]            
              ]
          }, parse_mode: 'html' } );            
      }
      else if(msg == "MESSAGE"){      
        bot.sendMessage(chatId, "Do you want to add any message at the beginning of your token contract?" , {  "reply_markup": {
            "inline_keyboard": [         
                [
                  {
                    text: "Yes",
                    callback_data: "message_yes",
    
                  },
                  {
                    text: "No",
                    callback_data: "message_no",
    
                  },
                ]            
            ]
        }, parse_mode: 'html' } );            
    }
        else if(msg == "FINAL"){
            const check = await RequestModel.findOne({ _id: requestId });

            if (!check) {
                console.log(`Request doesn't exists`);
                return { result: 0 };
            } else {
                 
                let msg = "Please review the data entered by you \n\n<b>NETWORK:</b> "+netwrokName[check.network] ;
                msg += "\n<b>TOKEN_NAME:</b> "+check.TOKEN_NAME ;
                msg += "\n<b>TOKEN_SYMBOL:</b> "+check.TOKEN_SYMBOL;
                msg += "\n<b>OWNER:</b> "+check.OWNER;
                msg += "\n<b>TOTAL_SUPPLY:</b> "+check.TOTAL_SUPPLY;
                if(check.FEE){
                  msg += "\n<b>FEE:</b> YES" ;
                  msg += "\n<b>BUY_OP_FEE:</b> "+parseFloat(check.BUY_OP_FEE/100).toFixed(2)+"%" ;
                  msg += "\n<b>BUY_TREASURY_FEE:</b> "+parseFloat(check.BUY_TREASURY_FEE/100).toFixed(2)+"%" ;
                  msg += "\n<b>SELL_OP_FEE:</b> "+parseFloat(check.SELL_OP_FEE/100).toFixed(2)+"%";
                  msg += "\n<b>SELL_TREASURY_FEE:</b> "+parseFloat(check.SELL_TREASURY_FEE/100).toFixed(2)+"%" ;
                  msg += "\n<b>MAX BUY FEE:</b> "+parseFloat(check.BUY_MAX/100).toFixed(2)+"%" ;
                  msg += "\n<b>MAX SELL FEE:</b> "+parseFloat(check.SELL_MAX/100).toFixed(2)+"%" ;
                  msg += "\n<b>OPERATING_ADDRESS:</b> "+check.OPERATING_ADDRESS ;
                  msg += "\n<b>TREASURY_ADDRESS:</b> "+check.TREASURY_ADDRESS ;
                }
                else{
                  msg += "\n<b>FEE:</b> NO" ;
                }
                if(check.TRADING){
                  msg += "\n<b>TRADING_CONTROL:</b> YES" ;
                  msg += "\n<b>TRADING_BLOCK_LIMIT:</b> "+check.TRADING_BLOCK_LIMIT ;

                }  else{
                  msg += "\n<b>TRADING:</b> NO" ;
                }

                if(check.TRANSFER_LIMIT){
                  msg += "\n<b>TRANSFER_LIMIT:</b> YES" ;
                  msg += "\n<b>MAX_WALLET:</b> "+check.MAX_WALLET ;
                  msg += "\n<b>SELL_LIMIT:</b> "+check.SELL_LIMIT ;
                  msg += "\n<b>BUY_LIMIT:</b> "+check.BUY_LIMIT ;

                }  else{
                  msg += "\n<b>TRANSFER_LIMIT:</b> NO" ;
                }

                if(check.TRANSFERDELAY){
                  msg += "\n<b>TRANSFERDELAY:</b> YES" ; 

                }  else{
                  msg += "\n<b>TRANSFERDELAY:</b> NO" ;
                }

                if(check.ANTISNIPER){
                  msg += "\n<b>ANTISNIPER:</b> YES" ; 
                  msg += "\n<b>SNIPING_BLOCK_LIMIT:</b> "+check.SNIPING_BLOCK_LIMIT ;


                }  else{
                  msg += "\n<b>ANTISNIPER:</b> NO" ;
                }

                if(check.AMM){
                  msg += "\n<b>AMM:</b> YES" ;
                  msg += "\n<b>ROUTER_ADDRESS:</b> "+check.ROUTER_ADDRESS ;
                  msg += "\n<b>BUY_LIQ_FEE:</b> "+parseFloat(check.BUY_LIQ_FEE/100).toFixed(2)+"%";
                  msg += "\n<b>SELL_LIQ_FEE:</b> "+parseFloat(check.SELL_LIQ_FEE/100).toFixed(2)+"%" ;
                  msg += "\n<b>SWAP_TOKENS_AT:</b> "+parseFloat(check.SWAP_TOKENS_AT/100).toFixed(2)+"%"

              }  else{
                msg += "\n<b>AMM:</b> NO" ;
              }
               
               
                msg += "\n<b>CA_CLOCK_PER:</b> "+(check.CA_CLOCK ? check.CA_CLOCK_PER+"%" : "NO") ; 
             
                msg += "\n<b>MESSAGE:</b> "+(check.MESSAGE ? check.MESSAGE_TEXT : "NA") ;

                bot.sendMessage(chatId, msg , {                         
                    parse_mode: "html",       
                    reply_markup: {
                        "inline_keyboard": [         
                            [
                              {
                                text: "Confirm !",
                                callback_data: "confirm_"+check._id,
                
                              }
                            ]            
                        ]
                    },
                });          
        }
        }
        else{
            bot.sendMessage(chatId, msg);
        }
    }
      catch(e){
        console.log(e);
      }
    }






    function replaceStringInObject(obj, targetString, replacement) {
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            // If the property is a string, replace the target string
            obj[key] = obj[key].replace(targetString, replacement);
          } else if (typeof obj[key] === 'object') {
            // If the property is an object, recursively call the function
            obj[key] = replaceStringInObject(obj[key], targetString, replacement);
          }
        }
        return obj; 
      }


// exports.UpdateRequest = async (data) => {
//     try {
//         const { request_id, user, ...updateData } = data; 

//         if (user) {
//             return { result: 0, message: 'User data cannot be updated' };
//         }

//         const existingRequest = await requestModel.findOne({ _id: request_id });

//         if (!existingRequest) {
//             return { result: 0, message: 'Request not found for update' };
//         }

    
//         Object.assign(existingRequest, updateData);

        
//         const updatedRequest = await existingRequest.save();

//         console.log(`Request with request_id ${request_id} updated successfully`);
//         return { result: 1, updatedRequest };
//     } catch (error) {
//         console.error(error);
//         return { result: 0, message: 'Internal server error' };
//     }
// };
