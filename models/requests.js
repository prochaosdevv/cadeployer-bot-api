const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  USER: String,
  network: Number,
  TOKEN_NAME: String,
  TOKEN_SYMBOL: String,
  OWNER: String,
  TOTAL_SUPPLY: Number,
  TRADING_CONTROLS: Boolean,
  TRADING_BLOCK_LIMIT: Number,
  ROUTER_ADDRESS: String,
  BUY_FEE_LIMIT: Number,
  SELL_FEE_LIMIT: Number,
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
  BUY_MAX: Number,
  SELL_MAX: Number,

  TRADING_BLOCK_LIMIT: Number,
  FEE: Boolean,
  TRADING: Boolean,
  AMM: Boolean,
  TRANSFER_LIMIT: Boolean,
  ANTISNIPER: Boolean,
  BLACKLIST: Boolean,
  TRANSFERDELAY: Boolean,
  CA_CLOCK: Boolean, 
  MESSAGE: Boolean,
  MESSAGE_TEXT: String
});

const RequestModel = mongoose.model('Request', requestSchema);
module.exports = RequestModel;
