const solc = require('solc');
const fs = require('fs');
const ethers = require('ethers');
const path = require('path');
require('dotenv').config()
const axios = require('axios');
const { flattenCode } = require('../utils/general');
const { createUser } = require('./user');
const  DeploymentModel   = require('../models/deployments');
const { verifyContract } = require('./verify');
const { symbols, PROVIDER } = require('../constants');
const RequestModel = require('../models/requests');
const { FEE_VARIABLE, FEE_EVENTS, FEE_FUNCTIONS, FEE_UPDATE_1, FEE_UPDATE_2, TRADING_VARIABLES, TRADING_ANTISNIPER, TRADING_CONDITIONS_1, TRADING_CONDITIONS_2, TRADING_CONDITIONS_3, TRADING_EVENTS, TRADING_FUNCTIONS, TRADING_VARIABLE_UPDATE_1, TRANSFER_LIMIT_VARIABLES, TRANSFER_LIMIT_FUNCTIONS, TRANSFER_LIMIT_EVENTS, TRANSFER_LIMIT_UPDATE_1, TRANSFER_LIMIT_CONDITION_1, TRANSFER_LIMIT_CONDITION_2, ANTISNIPER_CONDITION_1, ANTISNIPER_CONDITION_2, ANTISNIPER_UPDATE_1, ANTISNIPER_UPDATE_2, ANTISNIPER_FUNCTIONS, ANTISNIPER_EVENTS, ANTISNIPER_VARIABLES, AMM_VARIABLES, AMM_EVENTS, AMM_FUNCTION, AMM_CONDITION_1, AMM_UPDATE_1, AMM_UPDATE_3, AMM_UPDATE_4, AMM_UPDATE_5, AMM_UPDATE_6, AMM_UPDATE_7, AMM_UPDATE_8, AMM_UPDATE_9, AMM_UPDATE_10, AMM_UPDATE_11, AMM_UPDATE_12, AMM_UPDATE_2, BLACKLIST_VARIABLES, BLACKLIST_FUNCTIONS, BLACKLISTED_FUNCTION_1, TRANSFER_DELAY_VARIABLES, TRANSFERDELAY_FUNCTION, TRANSFERDELAY_CONDITION, CA_CLOCK_CONDTION, CA_CLOCK_DEFAULT, TRADING_CONDITIONS_4, ANTISNIPER_CONDITION_3, AMM_INPUT_1, AMM_UPDATE_13, AMM_UPDATE_14, FEE_UPDATE_3, FEE_CONDITION, AMM_CONDITION_2, FEE_CONDITION_2, FEE_UPDATE_4, FEE_UPDATE_5, FEE_UPDATE_6, FEE_UPDATE_7, FEE_UPDATE_8 } = require('../contracts/replacements');

// Set up your Ethereum provider (e.g., Infura)
 
exports.estimateGas = async ({data,private_key}) => {
  try{
  const { network , USER, TOKEN_NAME, TOKEN_SYMBOL, ROUTER_ADDRESS, OWNER, TOTAL_SUPPLY, BUY_MAX, SELL_MAX, MAX_WALLET, SWAP_TOKENS_AT, BUY_OP_FEE, BUY_LIQ_FEE , BUY_TREASURY_FEE, SELL_OP_FEE, SELL_TREASURY_FEE, SELL_LIQ_FEE, OPERATING_ADDRESS, TREASURY_ADDRESS, CA_CLOCK_PER} = data;
  const { walletAddress, privateKey } = await createUser({ username: USER });
  // console.log({walletAddress,privateKey})
  let _provider =  new ethers.JsonRpcProvider(PROVIDER[network]) ;  // default is 56

  const CONTRACT_NAME = TOKEN_NAME.replace(/\s/g, ""); ; 
    // console.log(CONTRACT_NAME);
  if (privateKey && walletAddress) {

    // Read the Solidity source code from your contract file
   
    // console.log(contractSource);
    let source = fs.readFileSync('./contracts/Token_AMM.sol', 'utf8');
    let contractSource = getFinalCode(source, data, 0) ; 
    console.log(contractSource);

    const contractFileName = CONTRACT_NAME + '.sol';
    const contractName = CONTRACT_NAME;

    // Compile the contract
    const input = {
      language: 'Solidity',
      sources: {
        [contractFileName]: {
          content: contractSource,
        },
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*'],
          },
        },
        optimizer: {
          enabled: true, // Enable the optimizer
          runs: 200,     // Number of optimization runs (adjust as needed)
      },
      },
    };

    // const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
    console.log(output);
    // Get the compiled contract's ABI and bytecode
    const contractABI = output.contracts[contractFileName][contractName].abi;
    const contractBytecode = output.contracts[contractFileName][contractName].evm.bytecode.object;

    // console.log('Contract ABI:', contractABI);
    // console.log('Contract Bytecode:', contractBytecode);

    // const privateKey = process.env.PRIVATE_KEY ; 
    // console.log(privateKey);
    const wallet = new ethers.Wallet(private_key ? private_key : privateKey, _provider);

    const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
    const deploymentData = await factory.getDeployTransaction();
    const estimateTx = await _provider.getFeeData();
    console.log(estimateTx);

    const gasEther = estimateTx.maxFeePerGas ? estimateTx.maxFeePerGas : estimateTx.gasPrice;
    const estimate = await wallet.estimateGas(deploymentData);
    estimate.get
    const gasFee = ethers.formatEther(gasEther * estimate);

    return gasFee.toString();

  }

}
catch(e){
  console.log(`error : ${e}`);
}
}
exports.deployStandardToken = async ({data, private_key}) => {
  try{
    // console.log(data);
  const { network, USER, TOKEN_NAME, TOKEN_SYMBOL, ROUTER_ADDRESS, OWNER, TOTAL_SUPPLY, BUY_MAX, SELL_MAX, MAX_WALLET, SWAP_TOKENS_AT, BUY_OP_FEE, BUY_LIQ_FEE , BUY_TREASURY_FEE, SELL_OP_FEE, SELL_TREASURY_FEE, SELL_LIQ_FEE, OPERATING_ADDRESS, TREASURY_ADDRESS, CA_CLOCK_PER} = data;
  const { walletAddress, privateKey } = await createUser({ username: USER });
  // console.log({walletAddress,privateKey})
  let _provider =  new ethers.JsonRpcProvider(PROVIDER[network]) ;  // default is 56
  const CONTRACT_NAME = TOKEN_NAME.replace(/\s/g, ""); ; 

  if (privateKey && walletAddress) {

    // Read the Solidity source code from your contract file
    let source = fs.readFileSync('./contracts/Token_AMM.sol', 'utf8');
    let contractSource = getFinalCode(source, data, 0) ; 
    
    // console.log(contractSource);

    const contractFileName = CONTRACT_NAME + '.sol';
    const contractName = CONTRACT_NAME;

    // Compile the contract
    const input = {
      language: 'Solidity',
      sources: {
        [contractFileName]: {
          content: contractSource,
        },
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*'],
          },
        },
        optimizer: {
          enabled: true, // Enable the optimizer
          runs: 200,     // Number of optimization runs (adjust as needed)
      },
      },
    }; 

    // const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
    console.log(output);
 
    // Get the compiled contract's ABI and bytecode
    const contractABI = output.contracts[contractFileName][contractName].abi;
    const contractBytecode = output.contracts[contractFileName][contractName].evm.bytecode.object;

    // console.log('Contract ABI:', contractABI);
    // console.log('Contract Bytecode:', contractBytecode);

    // const privateKey = process.env.PRIVATE_KEY ; 
    // console.log(privateKey); 
    const wallet = new ethers.Wallet(private_key ? private_key : privateKey, _provider);

    const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
    const deploymentData = await factory.getDeployTransaction();
    const estimateTx = await _provider.getFeeData();
    // console.log(deploymentData);

    const gasEther = estimateTx.maxFeePerGas ? estimateTx.maxFeePerGas : estimateTx.gasPrice;
    const estimate = await wallet.estimateGas(deploymentData);

    // const gasWei = ethers.parseUnits(estimate.toString(), 'gwei');
    // const gasEth = ethers.formatUnits(gasWei, 'ether');
    // const estimateEther = ethers.formatEther(estimate);

    const gasFee = ethers.formatEther(gasEther * estimate);

    const balanceWei = await _provider.getBalance(wallet.address);
    const balanceEther = ethers.formatEther(balanceWei);


    console.log("Wallet:"+ wallet.address);
    console.log("Gas Required:"+ gasFee);
    console.log("Gas Balance:"+ balanceEther);

    if (balanceEther > gasFee) {
      const gasLimit = 2100000 + 2100000; // Replace with your desired gas limit
      console.log(gasLimit);
      const contract = await factory.deploy({
        gasLimit: gasLimit, // Specify the gas limit here
      });
      const transactionHash = contract.deploymentTransaction();
      const txnHash  = transactionHash.hash;
      console.log('Contract deployed at address:', contract.target);

    

      const contractAddress = contract.target ; 
      const pathToCreate = path.join(__dirname, '../deployedContracts/' + contract.target + '.sol');
      // const pathToCreate = '../deployedContracts/'+contract.target+'.sol' ;
      fs.mkdirSync(path.dirname(pathToCreate), { recursive: true });
      fs.writeFileSync(pathToCreate, contractSource);
      flattenCode(contract.target);
     
    
 
      await RequestModel.findOneAndUpdate(
        { _id: data._id },
        { $set: {
            deployTxnHash :  txnHash ,
            contractAddress :  contractAddress
        } },
        { new: true } 
    );
       
      await DeploymentModel.create({
        walletAddress: walletAddress,
        hash: txnHash,
        contract: contractAddress,
        requestId: data._id
      })
      return { txnHash  , data : contractAddress }; 
    }
    else {
      console.log("NOT ENOUGH BALANCE");
      return { txnHash  : 0 , data : "NOT ENOUGH BALANCE.\n\nPlease fund the wallet "+walletAddress+" with "+gasFee+symbols[network] }; 


    }
  }
  else {
    console.log("wallet not found");
    return { txnHash  : 0 , data : "WALLET NOT FOUND" }; 

  }
  }
  catch(e){
    console.log(`error: ${e}`);
    return { txnHash  : 0 , data : (e.error ? e.error.message  : e )}; 

  }
}

function findImports(relativePath) {
  //my imported sources are stored under the node_modules folder!
  const absolutePath = path.resolve(__dirname, '../node_modules', relativePath);
  const source = fs.readFileSync(absolutePath, 'utf8');
  return { contents: source };
}

function getFinalCode(contractSource , data, rerun) {
  const { network , USER,TRADING ,MESSAGE ,MESSAGE_TEXT, TRADING_BLOCK_LIMIT,SNIPING_BLOCK_LIMIT, FEE , AMM , TRANSFER_LIMIT, ANTISNIPER, BLACKLIST, TRANSFERDELAY, CA_CLOCK,  TOKEN_NAME, TOKEN_SYMBOL , ROUTER_ADDRESS, OWNER, TOTAL_SUPPLY, BUY_MAX,BUY_FEE_LIMIT , SELL_FEE_LIMIT ,  SELL_MAX, MAX_WALLET, SWAP_TOKENS_AT, BUY_OP_FEE, BUY_LIQ_FEE , BUY_TREASURY_FEE, SELL_OP_FEE, SELL_TREASURY_FEE, SELL_LIQ_FEE, OPERATING_ADDRESS, TREASURY_ADDRESS, CA_CLOCK_PER} = data;
  // console.log(contractSource);

  if(TRADING){
    contractSource = contractSource.replaceAll('[TRADING_VARIABLE]', TRADING_VARIABLES);
    contractSource = contractSource.replaceAll('[TRADING_ANTISNIPER]', TRADING_ANTISNIPER);
    contractSource = contractSource.replaceAll('[TRADING_CONDITIONS_1]', TRADING_CONDITIONS_1);
    contractSource = contractSource.replaceAll('[TRADING_CONDITIONS_2]', TRADING_CONDITIONS_2);
    contractSource = contractSource.replaceAll('[TRADING_CONDITIONS_3]', TRADING_CONDITIONS_3);
    contractSource = contractSource.replaceAll('[TRADING_CONDITIONS_4]', TRADING_CONDITIONS_4);
    contractSource = contractSource.replaceAll('[TRADING_EVENTS]', TRADING_EVENTS);
    contractSource = contractSource.replaceAll('[TRADING_FUNCTIONS]', TRADING_FUNCTIONS);
    contractSource = contractSource.replaceAll('[TRADING_VARIABLE_UPDATE_1]', TRADING_VARIABLE_UPDATE_1);
  }
  else{
    contractSource = contractSource.replaceAll('[TRADING_VARIABLE]', '');
    contractSource = contractSource.replaceAll('[TRADING_CONDITIONS_1]', '');
    contractSource = contractSource.replaceAll('[TRADING_CONDITIONS_2]', '');
    contractSource = contractSource.replaceAll('[TRADING_CONDITIONS_3]', '');
    contractSource = contractSource.replaceAll('[TRADING_CONDITIONS_4]', '');
    contractSource = contractSource.replaceAll('[TRADING_EVENTS]', '');
    contractSource = contractSource.replaceAll('[TRADING_FUNCTIONS]', '');
    contractSource = contractSource.replaceAll('[TRADING_VARIABLE_UPDATE_1]', '');
  }

  if(FEE){
  contractSource = contractSource.replaceAll('[FEE_VARIABLE]', FEE_VARIABLE);
  contractSource = contractSource.replaceAll('[FEE_EVENTS]', FEE_EVENTS);
  contractSource = contractSource.replaceAll('[FEE_FUNCTIONS]', FEE_FUNCTIONS);
  contractSource = contractSource.replaceAll('[FEE_UPDATE_1]', FEE_UPDATE_1);
  contractSource = contractSource.replaceAll('[FEE_UPDATE_2]', FEE_UPDATE_2); 
  contractSource = contractSource.replaceAll('[FEE_UPDATE_3]', FEE_UPDATE_3); 
  contractSource = contractSource.replaceAll('[FEE_UPDATE_4]', FEE_UPDATE_4); 
  contractSource = contractSource.replaceAll('[FEE_UPDATE_5]', FEE_UPDATE_5); 
  contractSource = contractSource.replaceAll('[FEE_UPDATE_6]', FEE_UPDATE_6); 
  contractSource = contractSource.replaceAll('[FEE_UPDATE_7]', FEE_UPDATE_7); 
  contractSource = contractSource.replaceAll('[FEE_UPDATE_8]', FEE_UPDATE_8); 
  contractSource = contractSource.replaceAll('[FEE_CONDITION]', FEE_CONDITION); 
  contractSource = contractSource.replaceAll('[FEE_CONDITION_2]', FEE_CONDITION_2); 
  
  }
  else{
    contractSource = contractSource.replaceAll('[FEE_VARIABLE]', '');
    contractSource = contractSource.replaceAll('[FEE_EVENTS]', '');
    contractSource = contractSource.replaceAll('[FEE_FUNCTIONS]', '');
    contractSource = contractSource.replaceAll('[FEE_UPDATE_1]', '');
    contractSource = contractSource.replaceAll('[FEE_UPDATE_2]', '');
    contractSource = contractSource.replaceAll('[FEE_UPDATE_3]', '');
    contractSource = contractSource.replaceAll('[FEE_CONDITION]', '');
    contractSource = contractSource.replaceAll('[FEE_CONDITION_2]', '');
  contractSource = contractSource.replaceAll('[FEE_UPDATE_4]', ''); 
  contractSource = contractSource.replaceAll('[FEE_UPDATE_5]', ''); 
  contractSource = contractSource.replaceAll('[FEE_UPDATE_6]', ''); 
  contractSource = contractSource.replaceAll('[FEE_UPDATE_7]', ''); 
  contractSource = contractSource.replaceAll('[FEE_UPDATE_8]', ''); 

    
  }

  if(AMM){
    contractSource = contractSource.replaceAll('[AMM_VARIABLES]', AMM_VARIABLES);
    contractSource = contractSource.replaceAll('[AMM_EVENTS]', AMM_EVENTS);
    contractSource = contractSource.replaceAll('[AMM_FUNCTION]', AMM_FUNCTION);
    contractSource = contractSource.replaceAll('[AMM_CONDITION_1]', AMM_CONDITION_1);
    contractSource = contractSource.replaceAll('[AMM_UPDATE_1]', AMM_UPDATE_1);
    contractSource = contractSource.replaceAll('[AMM_UPDATE_2]', AMM_UPDATE_2);
    contractSource = contractSource.replaceAll('[AMM_UPDATE_3]', AMM_UPDATE_3);
    contractSource = contractSource.replaceAll('[AMM_UPDATE_4]', AMM_UPDATE_4);
    contractSource = contractSource.replaceAll('[AMM_UPDATE_5]', AMM_UPDATE_5);
    contractSource = contractSource.replaceAll('[AMM_UPDATE_6]', AMM_UPDATE_6);
    contractSource = contractSource.replaceAll('[AMM_UPDATE_7]', AMM_UPDATE_7);
    contractSource = contractSource.replaceAll('[AMM_UPDATE_8]', AMM_UPDATE_8);
    contractSource = contractSource.replaceAll('[AMM_UPDATE_9]', AMM_UPDATE_9);
    contractSource = contractSource.replaceAll('[AMM_UPDATE_10]', AMM_UPDATE_10);
    contractSource = contractSource.replaceAll('[AMM_UPDATE_11]', AMM_UPDATE_11);
    contractSource = contractSource.replaceAll('[AMM_UPDATE_12]', AMM_UPDATE_12); 
    contractSource = contractSource.replaceAll('[AMM_UPDATE_13]', AMM_UPDATE_13); 
    contractSource = contractSource.replaceAll('[AMM_INPUT_1]', AMM_INPUT_1); 
    contractSource = contractSource.replaceAll('[AMM_UPDATE_14]', AMM_UPDATE_14); 
    contractSource = contractSource.replaceAll('[AMM_CONDITION_2]', AMM_CONDITION_2); 

    
    }
    else{
      contractSource = contractSource.replaceAll('[AMM_VARIABLES]', '');
      contractSource = contractSource.replaceAll('[AMM_EVENTS]', '');
      contractSource = contractSource.replaceAll('[AMM_FUNCTION]', '');
      contractSource = contractSource.replaceAll('[AMM_CONDITION_1]', '');
      contractSource = contractSource.replaceAll('[AMM_UPDATE_1]', '');
      contractSource = contractSource.replaceAll('[AMM_UPDATE_2]', '');
      contractSource = contractSource.replaceAll('[AMM_UPDATE_3]', '');
      contractSource = contractSource.replaceAll('[AMM_UPDATE_4]', '');
      contractSource = contractSource.replaceAll('[AMM_UPDATE_5]', '');
      contractSource = contractSource.replaceAll('[AMM_UPDATE_6]', '');
      contractSource = contractSource.replaceAll('[AMM_UPDATE_7]', '');
      contractSource = contractSource.replaceAll('[AMM_UPDATE_8]', '');
      contractSource = contractSource.replaceAll('[AMM_UPDATE_9]', '');
      contractSource = contractSource.replaceAll('[AMM_UPDATE_10]', '');
      contractSource = contractSource.replaceAll('[AMM_UPDATE_11]', '');
      contractSource = contractSource.replaceAll('[AMM_UPDATE_12]', ''); 
      contractSource = contractSource.replaceAll('[AMM_UPDATE_13]', ''); 
      contractSource = contractSource.replaceAll('[AMM_UPDATE_14]', ''); 
      contractSource = contractSource.replaceAll('[AMM_INPUT_1]', ''); 
      contractSource = contractSource.replaceAll('[AMM_CONDITION_2]', ''); 
      

    }
    
  
  
  if(TRANSFER_LIMIT){
    contractSource = contractSource.replaceAll('[TRANSFER_LIMIT_VARIABLES]', TRANSFER_LIMIT_VARIABLES);
    contractSource = contractSource.replaceAll('[TRANSFER_LIMIT_FUNCTIONS]', TRANSFER_LIMIT_FUNCTIONS);
    contractSource = contractSource.replaceAll('[TRANSFER_LIMIT_EVENTS]', TRANSFER_LIMIT_EVENTS);
    contractSource = contractSource.replaceAll('[TRANSFER_LIMIT_UPDATE_1]', TRANSFER_LIMIT_UPDATE_1);
    contractSource = contractSource.replaceAll('[TRANSFER_LIMIT_CONDITION_1]', TRANSFER_LIMIT_CONDITION_1);
    contractSource = contractSource.replaceAll('[TRANSFER_LIMIT_CONDITION_2]', TRANSFER_LIMIT_CONDITION_2);
    }
    else{
      contractSource = contractSource.replaceAll('[TRANSFER_LIMIT_VARIABLES]', '');
      contractSource = contractSource.replaceAll('[TRANSFER_LIMIT_FUNCTIONS]', '');
      contractSource = contractSource.replaceAll('[TRANSFER_LIMIT_EVENTS]', '');
      contractSource = contractSource.replaceAll('[TRANSFER_LIMIT_UPDATE_1]', '');
      contractSource = contractSource.replaceAll('[TRANSFER_LIMIT_CONDITION_1]', '');
      contractSource = contractSource.replaceAll('[TRANSFER_LIMIT_CONDITION_2]', '');
    }
  

    if(ANTISNIPER){
    contractSource = contractSource.replaceAll('[ANTISNIPER_VARIABLES]', ANTISNIPER_VARIABLES);
    contractSource = contractSource.replaceAll('[ANTISNIPER_EVENTS]', ANTISNIPER_EVENTS);
    contractSource = contractSource.replaceAll('[ANTISNIPER_CONDITION_1]', ANTISNIPER_CONDITION_1);
    contractSource = contractSource.replaceAll('[ANTISNIPER_CONDITION_2]', ANTISNIPER_CONDITION_2);
    contractSource = contractSource.replaceAll('[ANTISNIPER_CONDITION_3]', ANTISNIPER_CONDITION_3);
    contractSource = contractSource.replaceAll('[ANTISNIPER_UPDATE_1]', ANTISNIPER_UPDATE_1);
    contractSource = contractSource.replaceAll('[ANTISNIPER_UPDATE_2]', ANTISNIPER_UPDATE_2);
    contractSource = contractSource.replaceAll('[TRADING_ANTISNIPER]', TRADING_ANTISNIPER);
    contractSource = contractSource.replaceAll('[ANTISNIPER_FUNCTIONS]', ANTISNIPER_FUNCTIONS);    
    contractSource = contractSource.replaceAll('[BLACKLIST_VARIABLES]',BLACKLIST_VARIABLES);  
    contractSource = contractSource.replaceAll('[BLACKLIST_FUNCTIONS]',BLACKLIST_FUNCTIONS);  
    contractSource = contractSource.replaceAll('[BLACKLISTED_FUNCTION_1]',BLACKLISTED_FUNCTION_1);  
    }
    else{
      contractSource = contractSource.replaceAll('[ANTISNIPER_VARIABLES]', '');
      contractSource = contractSource.replaceAll('[ANTISNIPER_EVENTS]', '');
      contractSource = contractSource.replaceAll('[ANTISNIPER_CONDITION_1]', '');
      contractSource = contractSource.replaceAll('[ANTISNIPER_CONDITION_2]', '');
      contractSource = contractSource.replaceAll('[ANTISNIPER_CONDITION_3]', '');
      contractSource = contractSource.replaceAll('[ANTISNIPER_UPDATE_1]', '');
      contractSource = contractSource.replaceAll('[ANTISNIPER_UPDATE_2]', '');
      contractSource = contractSource.replaceAll('[TRADING_ANTISNIPER]', '');
      contractSource = contractSource.replaceAll('[ANTISNIPER_FUNCTIONS]', '');  
      contractSource = contractSource.replaceAll('[BLACKLIST_VARIABLES]','');  
      contractSource = contractSource.replaceAll('[BLACKLIST_FUNCTIONS]','');  
      contractSource = contractSource.replaceAll('[BLACKLISTED_FUNCTION_1]','');  
    }

  if(BLACKLIST){
    contractSource = contractSource.replaceAll('[BLACKLIST_VARIABLES]',BLACKLIST_VARIABLES);  
    contractSource = contractSource.replaceAll('[BLACKLIST_FUNCTIONS]',BLACKLIST_FUNCTIONS);  
    contractSource = contractSource.replaceAll('[BLACKLISTED_FUNCTION_1]',BLACKLISTED_FUNCTION_1);  
  }else{
    contractSource = contractSource.replaceAll('[BLACKLIST_VARIABLES]','');  
    contractSource = contractSource.replaceAll('[BLACKLIST_FUNCTIONS]','');  
    contractSource = contractSource.replaceAll('[BLACKLISTED_FUNCTION_1]','');  
  }

  if(TRANSFERDELAY){
    contractSource = contractSource.replaceAll('[TRANSFER_DELAY_VARIABLES]',TRANSFER_DELAY_VARIABLES);  
    contractSource = contractSource.replaceAll('[TRANSFERDELAY_FUNCTION]',TRANSFERDELAY_FUNCTION);  
    contractSource = contractSource.replaceAll('[TRANSFERDELAY_CONDITION]',TRANSFERDELAY_CONDITION);  

  }
  else{
    contractSource = contractSource.replaceAll('[TRANSFER_DELAY_VARIABLES]','');  
    contractSource = contractSource.replaceAll('[TRANSFERDELAY_FUNCTION]','');  
    contractSource = contractSource.replaceAll('[TRANSFERDELAY_CONDITION]','');  

  }


  if(CA_CLOCK){
    contractSource = contractSource.replaceAll('[CA_CLOCK_CONDTION]',CA_CLOCK_CONDTION);  
  }
  else{
    contractSource = contractSource.replaceAll('[CA_CLOCK_CONDTION]',CA_CLOCK_DEFAULT);  
  }
  

  const CONTRACT_NAME = TOKEN_NAME.replace(/\s/g, ""); ; 

  contractSource = contractSource.replace('TOKEN_NAME', TOKEN_NAME);
  contractSource = contractSource.replace('TOKEN_SYMBOL', TOKEN_SYMBOL);
  contractSource = contractSource.replace("CONTRACT_NAME", CONTRACT_NAME);

  //New variables
  contractSource = contractSource.replaceAll('ROUTER_ADDRESS', ROUTER_ADDRESS);
  contractSource = contractSource.replaceAll('OWNER', OWNER);
  contractSource = contractSource.replaceAll('TOTAL_SUPPLY', TOTAL_SUPPLY);
  contractSource = contractSource.replaceAll('BUY_MAX', BUY_MAX);
  contractSource = contractSource.replaceAll('SELL_MAX', SELL_MAX);
  contractSource = contractSource.replaceAll('BUY_FEE_LIMIT', BUY_FEE_LIMIT);
  contractSource = contractSource.replaceAll('TRADING_BLOCK_LIMIT', TRADING_BLOCK_LIMIT ? TRADING_BLOCK_LIMIT : SNIPING_BLOCK_LIMIT);
  
  contractSource = contractSource.replaceAll('SELL_FEE_LIMIT', SELL_FEE_LIMIT);
  contractSource = contractSource.replaceAll('MAX_WALLET', MAX_WALLET);
  contractSource = contractSource.replaceAll('SWAP_TOKENS_AT', SWAP_TOKENS_AT);
  const SWAP_TOKENS_AT_PER = parseFloat(SWAP_TOKENS_AT / 10000).toFixed(2)
  contractSource = contractSource.replaceAll('SWAP_TOKENS_AT_PER', SWAP_TOKENS_AT_PER);
  contractSource = contractSource.replaceAll('BUY_OP_FEE', BUY_OP_FEE);
  contractSource = contractSource.replaceAll('BUY_LIQ_FEE', BUY_LIQ_FEE);
  contractSource = contractSource.replaceAll('BUY_TREASURY_FEE', BUY_TREASURY_FEE);
  contractSource = contractSource.replaceAll('SELL_OP_FEE', SELL_OP_FEE);
  contractSource = contractSource.replaceAll('SELL_TREASURY_FEE', SELL_TREASURY_FEE);
  contractSource = contractSource.replaceAll('SELL_LIQ_FEE', SELL_LIQ_FEE);

  contractSource = contractSource.replaceAll('OPERATING_ADDRESS', OPERATING_ADDRESS);
  contractSource = contractSource.replaceAll('TREASURY_ADDRESS', TREASURY_ADDRESS);
  contractSource = contractSource.replaceAll('CA_CLOCK_PER', CA_CLOCK_PER);
  
  if(MESSAGE){
    contractSource = "/* \n"+MESSAGE_TEXT+"\n */\n"+contractSource ;
  }
  if(rerun == 0){
    contractSource = getFinalCode(contractSource,data,1) ;
  }

  // console.log(contractSource);
  return contractSource ; 

}