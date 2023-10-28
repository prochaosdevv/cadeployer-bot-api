const { ObjectId } = require('mongodb');
const requestModel = require('../models/requests'); 
const users = require('../models/users');
const { createUser } = require('./user');
const { updatedCurrentField } = require('../utils/general');
const RequestModel = require('../models/requests');

const nextField = {
    network: "TOKEN_NAME",
    TOKEN_NAME: "TOKEN_SYMBOL",
    TOKEN_SYMBOL: "OWNER",
    OWNER: "TOTAL_SUPPLY",
    TOTAL_SUPPLY: "ROUTER_ADDRESS",
    ROUTER_ADDRESS: "BUY_MAX",
    BUY_MAX: "SELL_MAX",
    SELL_MAX: "MAX_WALLET",
    MAX_WALLET: "SWAP_TOKENS_AT",
    SWAP_TOKENS_AT: "BUY_OP_FEE",
    BUY_OP_FEE: "BUY_LIQ_FEE",
    BUY_LIQ_FEE: "BUY_TREASURY_FEE",
    BUY_TREASURY_FEE: "SELL_OP_FEE",
    SELL_OP_FEE: "SELL_TREASURY_FEE",
    SELL_TREASURY_FEE: "SELL_LIQ_FEE",
    SELL_LIQ_FEE: "OPERATING_ADDRESS",
    OPERATING_ADDRESS: "TREASURY_ADDRESS",
    TREASURY_ADDRESS: "CA_CLOCK_PER",
    CA_CLOCK_PER: "FINAL",
    FINAL: "FINAL",
}


const nextMsg = {
    network: "Please enter Token Name",
    TOKEN_NAME: "Please enter Token Symbol",
    TOKEN_SYMBOL: "Please enter Token Owner address",
    OWNER: "Please enter Token Supply",
    TOTAL_SUPPLY: "ROUTER_ADDRESS",
    ROUTER_ADDRESS: "Please enter max buy percentage of supply without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    BUY_MAX: "Please enter max sell percentage of supply without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    SELL_MAX: "Please enter max wallet limit percentage of supply without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    MAX_WALLET: "Please enter minimum amount percentage of supply that needs be hold by CA to make liquidity without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    SWAP_TOKENS_AT: "TOKEN_TAX",
    TOKEN_TAX: "Please enter buy operation fee percentage without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    BUY_OP_FEE: "Please enter buy liquiidty fee percentage without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    BUY_LIQ_FEE: "Please enter buy treasury fee percentage without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    BUY_TREASURY_FEE: "Please enter sell operation fee percentage without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    SELL_OP_FEE: "Please enter sell treasury fee percentage without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    SELL_TREASURY_FEE: "Please enter sell liquiidty fee percentage without % (Please enter in multiples of 100 for e.g. 100 for 1% ,150 for 1.5% and so on)",
    SELL_LIQ_FEE: "Please enter operating fee address",
    OPERATING_ADDRESS: "Please enter treasury fee address",
    TREASURY_ADDRESS: "Please enter initial CA lock percentage for liquidity sell without % (Please enter whole numbers only)",
    CA_CLOCK_PER: "FINAL",
    txnHash: "FINAL",
    FINAL: "FINAL"
}

const netwrokName = {
    [56] : "BSC Mainnet",
    [97] : "BSC Testnet"
}


const routerMarkup = {
    [97] : {  "reply_markup": {
        "inline_keyboard": [         
            [
              {
                text: "PancakeSwap Testnet 1",
                callback_data: "router_0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",

              },
              {
                text: "PancakeSwap Testnet 2",
                callback_data: "router_0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",

              },
            ]            
        ]
    }, parse_mode: 'html' },
    [56] : {  "reply_markup": {
        "inline_keyboard": [         
            [
              {
                text: "PancakeSwap Mainnet 1",
                callback_data: "router_0x10ED43C718714eb63d5aA57B78B54704E256024E",

              },
              {
                text: "PancakeSwap Mainnet 2",
                callback_data: "router_0x10ED43C718714eb63d5aA57B78B54704E256024E",

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
        else if(msg == "TOKEN_TAX"){      
            bot.sendMessage(chatId, "Do you want to add tax to your token ?" , {  "reply_markup": {
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
        else if(msg == "FINAL"){
            const check = await RequestModel.findOne({ _id: requestId });

            if (!check) {
                console.log(`Request doesn't exists`);
                return { result: 0 };
            } else {
                // console.log("Please review the data entered by you \n  Network: "+netwrokName[check.network]+" \nTOKEN_NAME: "+check.TOKEN_NAME+" \nTOKEN_SYMBOL: "+check.TOKEN_SYMBOL+" \nOWNER: "+check.OWNER+" \nTOTAL_SUPPLY: "+check.TOTAL_SUPPLY+" \nBUY_MAX: "+parseFloat(check.BUY_MAX/100).toFixed(2)+"% \nSELL_MAX: "+parseFloat(check.SELL_MAX/100).toFixed(2)+"% \nMAX_WALLET: "+parseFloat(check.MAX_WALLET/100).toFixed(2)+"% \nSWAP_TOKENS_AT: "+parseFloat(check.SWAP_TOKENS_AT/100).toFixed(2)+"% \nROUTER_ADDRESS: "+check.ROUTER_ADDRESS+" \nBUY_LIQ_FEE: "+parseFloat(check.BUY_LIQ_FEE/100).toFixed(2)+"% \nBUY_OP_FEE: "+parseFloat(check.BUY_OP_FEE/100).toFixed(2)+"% \nBUY_TREASURY_FEE: "+parseFloat(check.BUY_TREASURY_FEE/100).toFixed(2)+"% \nSELL_LIQ_FEE: "+parseFloat(check.SELL_LIQ_FEE/100).toFixed(2)+"% \nSELL_OP_FEE: "+parseFloat(check.SELL_OP_FEE/100).toFixed(2)+"% \nSELL_TREASURY_FEE: "+parseFloat(check.SELL_TREASURY_FEE/100).toFixed(2)+"% \nCA_CLOCK_PER: "+check.CA_CLOCK_PER+"% \nOPERATING_ADDRESS: "+check.OPERATING_ADDRESS+" \nTREASURY_ADDRESS: "+check.TREASURY_ADDRESS+" ");
                let msg = "Please review the data entered by you \n\n<b>NETWORK:</b> "+netwrokName[check.network]+" \n<b>TOKEN_NAME:</b> "+check.TOKEN_NAME+" \n<b>TOKEN_SYMBOL:</b> "+check.TOKEN_SYMBOL+" \n<b>OWNER:</b> "+check.OWNER+" \n<b>TOTAL_SUPPLY:</b> "+check.TOTAL_SUPPLY+" \n<b>BUY_MAX:</b> "+parseFloat(check.BUY_MAX/100).toFixed(2)+"% \n<b>SELL_MAX:</b> "+parseFloat(check.SELL_MAX/100).toFixed(2)+"% \n<b>MAX_WALLET:</b> "+parseFloat(check.MAX_WALLET/100).toFixed(2)+"% \n<b>SWAP_TOKENS_AT:</b> "+parseFloat(check.SWAP_TOKENS_AT/100).toFixed(2)+"% \n<b>ROUTER_ADDRESS:</b> "+check.ROUTER_ADDRESS+" \n<b>BUY_LIQ_FEE:</b> "+parseFloat(check.BUY_LIQ_FEE/100).toFixed(2)+"% \n<b>BUY_OP_FEE:</b> "+parseFloat(check.BUY_OP_FEE/100).toFixed(2)+"% \n<b>BUY_TREASURY_FEE:</b> "+parseFloat(check.BUY_TREASURY_FEE/100).toFixed(2)+"% \n<b>SELL_LIQ_FEE:</b> "+parseFloat(check.SELL_LIQ_FEE/100).toFixed(2)+"% \n<b>SELL_OP_FEE:</b> "+parseFloat(check.SELL_OP_FEE/100).toFixed(2)+"% \n<b>SELL_TREASURY_FEE:</b> "+parseFloat(check.SELL_TREASURY_FEE/100).toFixed(2)+"% \n<b>CA_CLOCK_PER:</b> "+check.CA_CLOCK_PER+"% \n<b>OPERATING_ADDRESS:</b> "+check.OPERATING_ADDRESS+" \n<b>TREASURY_ADDRESS:</b> "+check.TREASURY_ADDRESS ;

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
