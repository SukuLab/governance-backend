import nonceDal from '../dal/nonceDal';
import config from '../config/appConfig'
let sukuLogger = require('@suku/suku-logging')(config.app);
let nonceHelper = new Object();

nonceHelper.verifyNonce = async (address, nonce) => {
  try {

    let addressNonceResult = await nonceDal.fetch(address);

    if(addressNonceResult.status && addressNonceResult.data.nonce == nonce){
      sukuLogger.info('Nonce value supplied in the input is matched with the default value or the in the database collection');
      /* Nonce value supplied in the input is matched with the value in the database collection */
      return true;
    }

    return false;

  } catch (error) {
    sukuLogger.error('Nonce verification failed with error : ' + error.message);
    /* Failed to verify nonce */
    return false;
  }
}

export default nonceHelper;