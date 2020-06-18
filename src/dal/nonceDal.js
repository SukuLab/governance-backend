import nonceModel from '../models/nonceModel';
import config from '../config/appConfig'
let sukuLogger = require('@suku/suku-logging')(config.app);
const nonceDal = new Object();

nonceDal.fetch = async (documentReference) => {
  try {
    let addressNonce = await nonceModel.findOne({'_id': documentReference});

    if(addressNonce === null){
      /* addressNonce entry not exist. default nonce to send if db entry not exist : 0 */
      return { "status": true, "data": { nonce : 0 } };
    }

    return { "status": true, "data": addressNonce };
  } catch (error) {
    sukuLogger.error('Retrieve addressNonce dal failed with error : ' + error.message);
    return { "status": false, "data": error.message };
  }
}

nonceDal.save = async (addressNonce) => {
  try {

    let addressNonceResult = await nonceModel.findOne({ _id: addressNonce.ethereumAddress });

    if(addressNonceResult === null){
      /* addressNonce entry not exist. create one */
      let addressNonceUpdateResult = await nonceModel.findOneAndUpdate({
        _id: addressNonce.ethereumAddress
      }, {
        nonce: 1
      }, {
        upsert: true, 
        new: true
      });

      return { "status": true, "data": addressNonceUpdateResult };
    }

    let addressNonceUpdateResult = await nonceModel.findOneAndUpdate({
        _id: addressNonce.ethereumAddress,
        nonce: addressNonce.nonce
      }, {
        nonce: addressNonce.nonce + 1
      });

    if (addressNonceUpdateResult === null){

      return { "status": false, "data": {} };
    }

    return { "status": true, "data": addressNonceUpdateResult };
  } catch (error) {
    sukuLogger.error('Retrieve addressNonce dal failed with error : ' + error.message);
    return { "status": false, "data": error.message };
  }
}

export default nonceDal;