import express from 'express'
import nonceController from '../controllers/nonceController';
import { restMiddleware } from 'suku-utils';

const nonceRoute = express.Router();

nonceRoute.route("/:ethereumAddress")
	.get(async (req, res) => {
		let resBody = await nonceController.retriveAddressNonce(restMiddleware.parseRequest(req));
		res.send(resBody);
	});
	

export default nonceRoute;