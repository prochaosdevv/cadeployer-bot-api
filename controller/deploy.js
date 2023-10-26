const solc = require('solc');
const fs = require('fs');
const ethers = require('ethers');
const path = require('path');
require('dotenv').config()
const axios = require('axios');
const { flattenCode } = require('../utils/general');
const { createUser } = require('./user');
const deployments = require('../models/deployments');
const { verifyContract } = require('./verify');

// Set up your Ethereum provider (e.g., Infura)
const provider = new ethers.JsonRpcProvider(process.env.BSCTESTNETRPC);

exports.deployStandardToken = async (data) => {
  const { verifyContractNow, USER, CONTRACT_NAME, TOKEN_NAME, TOKEN_SYMBOL, ROUTER_ADDRESS, OWNER, TOTAL_SUPPLY, BUY_MAX, SELL_MAX, MAX_WALLET, SWAP_TOKENS_AT, BUY_OP_FEE, BUY_LIQ_FEE , BUY_TREASURY_FEE, SELL_OP_FEE, SELL_TREASURY_FEE, SELL_LIQ_FEE, OPERATING_ADDRESS, TREASURY_ADDRESS, CA_CLOCK_PER} = data;
  const { walletAddress, privateKey } = await createUser({ username: USER });
  // console.log({walletAddress,privateKey})
  if (privateKey && walletAddress) {

    // Read the Solidity source code from your contract file
    let contractSource = fs.readFileSync('./contracts/Token_AMM.sol', 'utf8');
    // console.log(contractSource);
    contractSource = contractSource.replace('TOKEN_NAME', TOKEN_NAME);
    contractSource = contractSource.replace('TOKEN_SYMBOL', TOKEN_SYMBOL);
    contractSource = contractSource.replace("Token_Standard", CONTRACT_NAME);

    //New variables
    contractSource = contractSource.replace('ROUTER_ADDRESS', ROUTER_ADDRESS);
    contractSource = contractSource.replace('OWNER', OWNER);
    contractSource = contractSource.replace('TOTAL_SUPPLY', TOTAL_SUPPLY);
    contractSource = contractSource.replace('BUY_MAX', BUY_MAX);
    contractSource = contractSource.replace('SELL_MAX', SELL_MAX);
    contractSource = contractSource.replace('MAX_WALLET', MAX_WALLET);
    contractSource = contractSource.replace('SWAP_TOKENS_AT', SWAP_TOKENS_AT);
    const SWAP_TOKENS_AT_PER = parseFloat(SWAP_TOKENS_AT / 10000).toFixed(2)
    contractSource = contractSource.replace('SWAP_TOKENS_AT_PER', SWAP_TOKENS_AT_PER);
    contractSource = contractSource.replace('BUY_OP_FEE', BUY_OP_FEE);
    contractSource = contractSource.replace('BUY_LIQ_FEE', BUY_LIQ_FEE);
    contractSource = contractSource.replace('BUY_TREASURY_FEE', BUY_TREASURY_FEE);
    contractSource = contractSource.replace('SELL_OP_FEE', SELL_OP_FEE);
    contractSource = contractSource.replace('SELL_TREASURY_FEE', SELL_TREASURY_FEE);
    contractSource = contractSource.replace('SELL_LIQ_FEE', SELL_LIQ_FEE);

    contractSource = contractSource.replace('OPERATING_ADDRESS', OPERATING_ADDRESS);
    contractSource = contractSource.replace('TREASURY_ADDRESS', TREASURY_ADDRESS);
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
    const wallet = new ethers.Wallet(privateKey, provider);

    const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
    const deploymentData = await factory.getDeployTransaction();
    const estimateTx = await provider.getFeeData();
    // console.log(deploymentData);

    const gasEther = ethers.formatEther(estimateTx.gasPrice);
    const estimate = await wallet.estimateGas(deploymentData);

    // const gasWei = ethers.parseUnits(estimate.toString(), 'gwei');
    // const gasEth = ethers.formatUnits(gasWei, 'ether');
    // const estimateEther = ethers.formatEther(estimate);

    const gasFee = ethers.formatEther(estimateTx.gasPrice * estimate);

    const balanceWei = await provider.getBalance(walletAddress);
    const balanceEther = ethers.formatEther(balanceWei);


    console.log("Wallet:"+ walletAddress);
    console.log("Gas Required:"+ gasFee);
    console.log("Gas Balance:"+ balanceEther);

    if (balanceEther > gasFee) {
      const contract = await factory.deploy();
      console.log('Contract deployed at address:', contract.target);

      await deployments.insertMany({
        walletAddress: walletAddress,
        contract: contract.target
      })

      const pathToCreate = path.join(__dirname, '../deployedContracts/' + contract.target + '.sol');
      // const pathToCreate = '../deployedContracts/'+contract.target+'.sol' ;
      fs.mkdirSync(path.dirname(pathToCreate), { recursive: true });
      fs.writeFileSync(pathToCreate, contractSource);
      flattenCode(contract.target);

      //delay for 5 sec
      setTimeout(async () => {
        const flattened = path.join(__dirname, '../flattened/' + contract.target + '.sol');
        if (verifyContractNow) {
          let contractSource = fs.readFileSync(flattened, 'utf8');
          await verifyContract(contract.target, null, contractName, contractSource);
        }

      }, 10000);
    }
    else {
      console.log("not enough balance");

    }
  }
  else {

    console.log("wallet not found");
  }

}

function findImports(relativePath) {
  //my imported sources are stored under the node_modules folder!
  const absolutePath = path.resolve(__dirname, '../node_modules', relativePath);
  const source = fs.readFileSync(absolutePath, 'utf8');
  return { contents: source };
}


