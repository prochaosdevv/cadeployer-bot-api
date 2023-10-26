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
    } 
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeploymentModel', deploymentSchema);
