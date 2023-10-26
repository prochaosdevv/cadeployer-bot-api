const path = require('path'); 
const { spawn } = require('child_process');
const fs = require('fs');

const deployments = require('../models/deployments');
const { getUser } = require('../controller/user');
const { default: axios } = require('axios');

exports.verify = async (user,contractName,contract) => {
    try{
   
     const result = await getUser(user) ; 
   
     if(result.walletAddress){
       const filter = { walletAddress: result.walletAddress , contract : contract }; // Define your filter criteria
    
       const checkEntry = await deployments.findOne(filter);
      
      //  console.log(checkEntry);
      if(!checkEntry){
          console.log(`contract owner doesn't match`);
          return {result : 0}
      }
      else {
         console.log(`contract matched`); 
   
         const flattened = path.join(__dirname, '../flattened/'+contract+'.sol');
    
         let contractSource = fs.readFileSync(flattened, 'utf8');
         const result  = await this.verifyContract(contract,null,contractName,contractSource);  
         return {result : 1, data : result}
         
      }
     }
     else{
       console.log(`user not found`); 
       return {result : 0}
   
     }
    
   
    
   } catch (error) {
     console.error('Error:', error.message);
     return 0;
   
   }
   
   
   
    }
   
   
   
    exports.verifyContract = async (address,args,name,contractSource) => {
     const apiEndpoint = process.env.BSCTESTURL; // Etherscan API endpoint
   
     // Replace these with your contract information
     const contractAddress = address;
     const compilerVersion = 'v0.8.0+commit.c7dfd78e'; // Solidity compiler version
     const constructorArguments = args; // Comma-separated constructor arguments
    
     // Your API key
     const apiKey = process.env.BSCTESTAPI;
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
       
       axios.request(config)
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