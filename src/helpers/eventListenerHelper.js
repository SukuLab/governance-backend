import config from '../config/appConfig'
import proposalDal from "../dal/proposalDal";
import gov from '@suku/suku-governance-eth-lib';
let sukuLogger = require('@suku/suku-logging')(config.app);

const sukuTokenContactAddress = config.bc.node.public.tokenContractAddress;
const BcURL = config.bc.node.public.url;


sukuLogger.debug('sukuTokenContactAddress : ' + sukuTokenContactAddress);
sukuLogger.debug('public node url : ' + BcURL);

let EthGovernance = new gov(sukuTokenContactAddress, BcURL);

const registerOnstartEventListeners = (callback) => {
	try {

		EthGovernance.transferEmitter.on('Transfer', async function (blockNumber, fromAddress, toAddress) {

			sukuLogger.info(
				`Recieved a Transfer event from ERC20 contract at address: ${sukuTokenContactAddress}. 
				 Blocknumber: ${blockNumber} From: ${fromAddress} To: ${toAddress}`
			);

			let fromTokenBalance = await EthGovernance.getTokenBalance(fromAddress, blockNumber);
			let toTokenBalance = await EthGovernance.getTokenBalance(toAddress, blockNumber);

			let proposalDalFromAddressUpdateStatus = await proposalDal.update({
				'expired': false,
				'votes._id': fromAddress
			}, {
					'votes.$.votes': fromTokenBalance
				});

			sukuLogger.info('Updated votes status : ' + proposalDalFromAddressUpdateStatus.status + ' @transferEmitterEvent for fromAddress ' + fromAddress);

			let proposalDalToAddressUpdateStatus = await proposalDal.update({
				'expired': false,
				'votes._id': toAddress
			}, {
					'votes.$.votes': toTokenBalance
				});

			sukuLogger.info('Updated votes status : ' + proposalDalToAddressUpdateStatus.status + ' @transferEmitterEvent for toAddress ' + toAddress);

			sukuLogger.info(`From address balance: ${fromTokenBalance}. To address balance: ${toTokenBalance}.`);
		});

		// eslint-disable-next-line callback-return
		callback("Initiated the registration for listeners");

	} catch (error) {
		// eslint-disable-next-line callback-return
		callback("Failed @registerOnstartEventListeners with error : " + error.message);
	}
};

export default {
	"registerOnstartEventListeners": registerOnstartEventListeners
};