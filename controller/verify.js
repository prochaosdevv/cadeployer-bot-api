const path = require('path'); 
const { spawn } = require('child_process');
const fs = require('fs');

const deployments = require('../models/deployments');
const { getUser } = require('../controller/user');
const { default: axios } = require('axios');
const RequestModel = require('../models/requests');
const { CONTRACT_URL, API_KEYS, API_URL } = require('../constants');
const { request } = require('http');


exports.verifyOffline = async (TOKEN_NAME,contract) => {
  try{
   
    
    console.log(`contract matched`); 

    const flattened = path.join(__dirname, '../flattened/'+contract+'.sol');

    let contractSource = fs.readFileSync(flattened, 'utf8');
    const _result  = await this.verifyContract(contract,null,TOKEN_NAME,97,contractSource);  
    console.log(_result)
    if(_result.message == "OK"){
     await deployments.findOneAndUpdate(
       { contract: contract },
       { $set: {
         verifyId : _result.result 
       } },
       { new: true } 
   );

    }
    return {result : 1, CONTRACT_URL: contract , data : _result}
     



} catch (error) {
console.error('Error:', error.message);
return {result : 0, data: "SEVER ERROR"}


}
}
exports.verify = async (user,contract) => {
    try{
   
   
     const requestDetail = await RequestModel.findOne({contractAddress: contract}) ; 
     if(requestDetail){
       const filter = {  contract : contract }; // Define your filter criteria
      console.log(requestDetail);
      //  console.log(checkEntry);
      if(requestDetail.USER !== user){
          console.log(`contract owner doesn't match`);
          return {result : 0, data: `Contract owner doesn't match`}
      }
      else {
         console.log(`contract matched`); 
     
         const flattened = path.join(__dirname, '../flattened/'+contract+'.sol');
    
         let contractSource = fs.readFileSync(flattened, 'utf8');
         const _result  = await this.verifyContract(contract,null,requestDetail.TOKEN_NAME,requestDetail.network,contractSource);  
         console.log(_result)
         if(_result.message == "OK"){
          await deployments.findOneAndUpdate(
            { contract: contract },
            { $set: {
              verifyId : _result.result 
            } },
            { new: true } 
        );

         }
         return {result : 1, CONTRACT_URL: CONTRACT_URL[requestDetail.network]+contract , data : _result}
         
      }
     }
     else{
       console.log(`user not found`); 
       return {result : 0, data: `Contract not found`}
   
     }
    
   
    
   } catch (error) {
     console.error('Error:', error.message);
     return {result : 0, data: "SEVER ERROR"}

   
   }
   
   
   
    }
   
   
   
    exports.verifyContract = async (address,args,name,network,contractSource) => {
     const apiEndpoint = API_URL[network]; // Etherscan API endpoint
   
     // Replace these with your contract information
     const contractAddress = address;
     const compilerVersion = 'v0.8.0+commit.c7dfd78e'; // Solidity compiler version
     const constructorArguments = args; // Comma-separated constructor arguments
    
     // Your API key
     const apiKey = API_KEYS[network];
     // console.log(contractAddress);
     const data = {
       apikey: apiKey,
       module: 'contract',
       action: 'verifysourcecode',
       contractaddress: contractAddress,
       sourceCode: contractSource,
       contractname: name,
       compilerversion: compilerVersion,
       licenseType: 3,
       optimizationUsed: 1,
       runs: 200
     };
   
     // console.log(data);
     try {
       let config = {
         method: 'post',
         maxBodyLength: Infinity,
         url: apiEndpoint ,
         headers: { 
           'Content-Type': 'application/x-www-form-urlencoded'
         },
         data : data 
       };
       
    return  axios.request(config)
       .then((response) => {
        console.log(response.data);

         return response.data;
       })
       .catch((error) => {
         console.log(error);
         return 0;
   
       });
     } catch (error) {
       console.error('Error:', error.message);
       return 0;
   
     }
   }