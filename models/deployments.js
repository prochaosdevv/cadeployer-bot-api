const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true
    },
    contract: {
      type: String,
      required: true
    },
    requestId: {
      type: String,
      required: true
    },
    hash: {
      type: String,
      required: true
    },
    verifyId: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeploymentModel', deploymentSchema);
