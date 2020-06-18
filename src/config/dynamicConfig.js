import appConfig from './appConfig';
import vaultService from "../services/vaultService";
import asleep from 'asleep';
let sukuLogger = require('@suku/suku-logging')(appConfig.app);
const connectionRetryIntervalInMs = appConfig.services.vault.connectionRetryIntervalInMs;
let dynamicConfig = new Object();
dynamicConfig.loadConfig = {};
dynamicConfig.config = {};
let vaultServiceAvailable = false;

dynamicConfig.loadConfig = async () => {
  try {
    do {
      let vaultServiceMongoResponse = await vaultService.readVault('mongodb');
      if (vaultServiceMongoResponse.status) {
        vaultServiceAvailable = true
        const mongodb = vaultServiceMongoResponse.data;
        const dynamicEnvironments = {
          "mongodb": {
            "sukuGovernance": mongodb.native.sukuGovernance,
            "crgeneral": mongodb.native.mailer
          }
        };
        sukuLogger.info('vault-service connected successfully');
        dynamicConfig.config = dynamicEnvironments;
        module.exports = dynamicConfig;
      } else {
        sukuLogger.warning('unable to connect vault-service. trying again ...');
        await asleep(connectionRetryIntervalInMs);
      }
    } while (vaultServiceAvailable == false);
  } catch (error) {
    sukuLogger.error('vaultConnect @dynamicConfig failed with error : ' + error.message);
  }
}

module.exports = dynamicConfig;