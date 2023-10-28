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

// Set up your Ethereum provider (e.g., Infura)
 
exports.estimateGas = async ({data,private_key}) => {
  try{
  const { network , USER, TOKEN_NAME, TOKEN_SYMBOL, ROUTER_ADDRESS, OWNER, TOTAL_SUPPLY, BUY_MAX, SELL_MAX, MAX_WALLET, SWAP_TOKENS_AT, BUY_OP_FEE, BUY_LIQ_FEE , BUY_TREASURY_FEE, SELL_OP_FEE, SELL_TREASURY_FEE, SELL_LIQ_FEE, OPERATING_ADDRESS, TREASURY_ADDRESS, CA_CLOCK_PER} = data;
  const { walletAddress, privateKey } = await createUser({ username: USER });
  // console.log({walletAddress,privateKey})
  let _provider =  new ethers.JsonRpcProvider(PROVIDER[network]) ;  // default is 56

  const CONTRACT_NAME = TOKEN_NAME ; 

  if (privateKey && walletAddress) {

    // Read the Solidity source code from your contract file
    let contractSource = fs.readFileSync('./contracts/Token_AMM.sol', 'utf8');
    // console.log(contractSource);
    contractSource = contractSource.replace('TOKEN_NAME', TOKEN_NAME);
    contractSource = contractSource.replace('TOKEN_SYMBOL', TOKEN_SYMBOL);
    contractSource = contractSource.replace("Token_Standard", TOKEN_NAME);

    //New variables
    contractSource = contractSource.replaceAll('ROUTER_ADDRESS', ROUTER_ADDRESS);
    contractSource = contractSource.replaceAll('OWNER', OWNER);
    contractSource = contractSource.replaceAll('TOTAL_SUPPLY', TOTAL_SUPPLY);
    contractSource = contractSource.replaceAll('BUY_MAX', BUY_MAX);
    contractSource = contractSource.replaceAll('SELL_MAX', SELL_MAX);
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

    const gasEther = estimateTx.gasPrice;
    const estimate = await wallet.estimateGas(deploymentData);

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
  const { network, USER, TOKEN_NAME, TOKEN_SYMBOL, ROUTER_ADDRESS, OWNER, TOTAL_SUPPLY, BUY_MAX, SELL_MAX, MAX_WALLET, SWAP_TOKENS_AT, BUY_OP_FEE, BUY_LIQ_FEE , BUY_TREASURY_FEE, SELL_OP_FEE, SELL_TREASURY_FEE, SELL_LIQ_FEE, OPERATING_ADDRESS, TREASURY_ADDRESS, CA_CLOCK_PER} = data;
  const { walletAddress, privateKey } = await createUser({ username: USER });
  // console.log({walletAddress,privateKey})
  let _provider =  new ethers.JsonRpcProvider(PROVIDER[network]) ;  // default is 56

  const CONTRACT_NAME = TOKEN_NAME ; 
  if (privateKey && walletAddress) {

    // Read the Solidity source code from your contract file
    let contractSource = fs.readFileSync('./contracts/Token_AMM.sol', 'utf8');
    // console.log(contractSource);
    contractSource = contractSource.replace('TOKEN_NAME', TOKEN_NAME);
    contractSource = contractSource.replace('TOKEN_SYMBOL', TOKEN_SYMBOL);
    contractSource = contractSource.replace("Token_Standard", CONTRACT_NAME);

    //New variables
    contractSource = contractSource.replaceAll('ROUTER_ADDRESS', ROUTER_ADDRESS);
    contractSource = contractSource.replaceAll('OWNER', OWNER);
    contractSource = contractSource.replaceAll('TOTAL_SUPPLY', TOTAL_SUPPLY);
    contractSource = contractSource.replaceAll('BUY_MAX', BUY_MAX);
    contractSource = contractSource.replaceAll('SELL_MAX', SELL_MAX);
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

    const gasEther = ethers.formatEther(estimateTx.gasPrice);
    const estimate = await wallet.estimateGas(deploymentData);

    // const gasWei = ethers.parseUnits(estimate.toString(), 'gwei');
    // const gasEth = ethers.formatUnits(gasWei, 'ether');
    // const estimateEther = ethers.formatEther(estimate);

    const gasFee = ethers.formatEther(estimateTx.gasPrice * estimate);

    const balanceWei = await _provider.getBalance(wallet.address);
    const balanceEther = ethers.formatEther(balanceWei);


    console.log("Wallet:"+ wallet.address);
    console.log("Gas Required:"+ gasFee);
    console.log("Gas Balance:"+ balanceEther);

    if (balanceEther > gasFee) {
      const contract = await factory.deploy(); 
      const transactionHash = contract.deploymentTransaction();
      const txnHash  = transactionHash.hash;
      console.log('Contract deployed at address:', contract.target);

    

      const contractAddress = contract.target ; 
      const pathToCreate = path.join(__dirname, '../deployedContracts/' + contract.target + '.sol');
      // const pathToCreate = '../deployedContracts/'+contract.target+'.sol' ;
      fs.mkdirSync(path.dirname(pathToCreate), { recursive: true });
      fs.writeFileSync(pathToCreate, contractSource);
      flattenCode(contract.target);

      //delay for 5 sec
      setTimeout(async () => {
        const flattened = path.join(__dirname, '../flattened/' + contract.target + '.sol');      
      }, 10000);
 
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
  }
}

function findImports(relativePath) {
  //my imported sources are stored under the node_modules folder!
  const absolutePath = path.resolve(__dirname, '../node_modules', relativePath);
  const source = fs.readFileSync(absolutePath, 'utf8');
  return { contents: source };
}


  