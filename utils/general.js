const {ethers , Wallet, HDNodeWallet} = require('ethers');
const path = require('path'); 
const { spawn } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const bip39 = require('bip39');
const users = require('../models/users');


 
exports.generateRandomWalletKey = (_index) => {
  const seedPhrase = process.env.SECRET ; 
  // Check if the mnemonic phrase is valid
  const isValid = bip39.validateMnemonic(seedPhrase);

  if (isValid) {
    console.log('The mnemonic phrase is valid and compatible with the BIP39 standard.');
  
  // console.log(ethers.Wallet);
  const hdnode = ethers.HDNodeWallet.fromPhrase(seedPhrase);
  const wallet = hdnode.derivePath(`m/44'/60'/0'/0/${_index}`);

  // const wallet = ethers.Wallet.createRandom()
  // console.log(wallet.mnemonic); 
    return {
        address : wallet.address,
        privateKey : wallet.privateKey
    }
  } else {
    console.error('The mnemonic phrase is invalid or not compatible with BIP39.');
    return { result : 0}
  }
}

 
exports.flattenCode = (address) => {

// Define the paths to your input and output files
const inputFile = path.join(__dirname, '../deployedContracts/'+address+'.sol');
const pathToCreate = path.join(__dirname, '../flattened/'+address+'.sol') ; 
fs.mkdirSync(path.dirname(pathToCreate), { recursive: true });
// console.log(inputFile);
const outputFile =pathToCreate;

// Run the truffle-flattener command
const flattenerProcess = spawn('truffle-flattener', [inputFile]);
// console.log(flattenerProcess);
var scriptOutput = ""; 
flattenerProcess.stdout.setEncoding('utf8');

flattenerProcess.stdout.on('data', (data) => {
  // Write the flattened code to the output file
  // console.log(data);
  scriptOutput += data;
});





flattenerProcess.on('close', (code) => {

  if (code === 0) {
    // console.log(scriptOutput);
    scriptOutput = scriptOutput.replaceAll("// SPDX-License-Identifier: MIT","");
    scriptOutput = "// SPDX-License-Identifier: MIT \n"+scriptOutput;
  require('fs').writeFileSync(outputFile, scriptOutput.toString());
    console.log(`Flattening complete. Check ${outputFile} for the flattened code.`);
  } else {
    console.error('Flattening failed.');
  }
});

}

exports.updatedCurrentField = async (username,field) => {
  try{
    const updateUser = await users.findOneAndUpdate(
      { username: username },
      { $set: {
          currentField :  field
      }},
      { new: true } 
  );
  console.log(updateUser)
  
  return {result: 1, updated: updateUser} ;
  
  }
  catch(e){
    console.log(e);
  }
  }