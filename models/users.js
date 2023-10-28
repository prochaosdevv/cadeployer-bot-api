const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {  
      type: String,
      required: true
    },
    walletAddress: {
      type: String,
      required: true
    },
    privateKey: {
      type: String,
      required: true
    },   
    currentRequest: {
      type: String
    },   
    currentField: {
      type: String
    } 
    
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserModel', userSchema);
