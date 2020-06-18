import nonceDal from '../dal/nonceDal';
import appHelper from '../helpers/appHelper';
import governanceValidator from '../validators/governanceValidator';
import config from '../config/appConfig'
let sukuLogger = require('@suku/suku-logging')(config.app);

let nonceController = new Object();

nonceController.retriveAddressNonce = async (request) => {
	try {

		if(!governanceValidator.GetAddressNonce(request.params)){
			return appHelper.apiResponse(400, 'invalid-request', {});
		}

		let ethereumAddress = request.params.ethereumAddress;
		sukuLogger.info('ethereumAddress : ' + ethereumAddress);
		let nonceDalResponse = await nonceDal.fetch(ethereumAddress);
		sukuLogger.info('nonceDalResponse : retrieve address nonce ' + JSON.stringify(nonceDalResponse));
		
		if(nonceDalResponse.status && nonceDalResponse.data !== null){
			return appHelper.apiResponse(200, 'success', {
				"nonce": nonceDalResponse.data.nonce
			}, 'nonce-fetch-success');
		}

		if(nonceDalResponse.status && nonceDalResponse.data === null){
			return appHelper.apiResponse(404, 'resource-not-found', {}, 'nonce-address-notfound');
		}

		return appHelper.apiResponse(500, 'internal-error', {}, 'internal-error');
	} catch (error) {
		sukuLogger.error('Retrieve address nonce failed with error : ' + error.message);
		return appHelper.apiResponse(500, 'internal-error', {}, 'internal-error');
	}

}


nonceController.insertAddressNonce = async (addressNonce) => {
	try {
		let nonceDalResponse = await nonceDal.save(addressNonce);
		sukuLogger.info('nonceDalResponse @save' + JSON.stringify(nonceDalResponse));
		if(nonceDalResponse.status){
			return true;
		} 
		return false;
	} catch (error) {
		sukuLogger.error('Nonce dal save failed with error : ' + error.message);
		return false;
	}
}


export default nonceController;