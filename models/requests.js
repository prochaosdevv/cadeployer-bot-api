const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  USER: String,
  network: Number,
  TOKEN_NAME: String,
  TOKEN_SYMBOL: String,
  OWNER: String,
  TOTAL_SUPPLY: Number,
  ROUTER_ADDRESS: String,
  BUY_MAX: Number,
  SELL_MAX: Number,
  MAX_WALLET: Number,
  SWAP_TOKENS_AT: Number,
  BUY_OP_FEE: Number,
  BUY_LIQ_FEE: Number,
  BUY_TREASURY_FEE: Number,
  SELL_OP_FEE: Number,
  SELL_TREASURY_FEE: Number,
  SELL_LIQ_FEE: Number,
  CA_CLOCK_PER: Number,
  OPERATING_ADDRESS: String,
  TREASURY_ADDRESS: String,
  txnHash: String,
  deployTxnHash: String,
  contractAddress: String,
});

const RequestModel = mongoose.model('Request', requestSchema);
module.exports = RequestModel;
