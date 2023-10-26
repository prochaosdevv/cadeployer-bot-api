 
const userModel = require('../models/users');
const { generateRandomWalletKey } = require('../utils/general'); 

exports.createUser = async (data) => {
    try{
        
         const filter = { username: data.username }; // Define your filter criteria

         const accountIndex = await userModel.countDocuments();
         const checkEntry = await userModel.findOne(filter);
        
        //  console.log(checkEntry);
        if(!checkEntry){
            const {address , privateKey} = generateRandomWalletKey(accountIndex);
            const updateDocument = {
                $set: {
                    walletAddress: address,
                    privateKey: privateKey, 
                },
            };
            const options = {
                upsert: true, // Enable upsert
            };
            const result = await userModel.updateOne(filter, updateDocument, options);
            if (result.upsertedId) {
                console.log(`Inserted a new document with _id: ${result.upsertedId}`);
                return {result : 1, walletAddress : address, privateKey: privateKey}
            } else {
                console.log(`Updated an existing document`);
                return {result : 1, walletAddress : checkEntry.walletAddress, privateKey: checkEntry.privateKey}

            }
        }
        else {
            console.log(`Entry already exist`);
            // console.log(checkEntry);
            return {result : 1, walletAddress : checkEntry.walletAddress, privateKey: checkEntry.privateKey}
        }

    }
    catch(e){
        console.log(e);
        return {result : 0}

    }
    finally{ 
        // await dbConnect.close();
        // console.log("DB disconnected successfully");
    }

}



exports.getUser = async (data) => {
    try{
        
         const filter = { username: data.username }; // Define your filter criteria
 
         const checkEntry = await userModel.findOne(filter);
        
        //  console.log(checkEntry);
        if(!checkEntry){
            console.log(`Entry doesn't exist`);
            return {result : 0}
        }
        else {
            console.log(`Entry exist`); 
            return {result : 1, walletAddress : checkEntry.walletAddress, privateKey: checkEntry.privateKey}
        }

    }
    catch(e){
        console.log(e);
        return {result : 0}

    }
     

}