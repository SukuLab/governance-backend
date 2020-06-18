import express from 'express'
import proposalController from '../controllers/proposalController';
import { restMiddleware } from 'suku-utils';

const proposalRoute = express.Router();

proposalRoute.route("/")
	.post(async (req, res) => {
		let resBody = await proposalController.createNewProposal(restMiddleware.parseRequest(req));
		res.send(resBody);
	})
	.get(async (req, res) => {
		let resBody = await proposalController.retrieveAllProposal(restMiddleware.parseRequest(req));
		res.send(resBody);
	});

	proposalRoute.route("/:proposalId/votes")
	.post(async (req, res) => {
		let resBody = await proposalController.castvote(restMiddleware.parseRequest(req));
		res.send(resBody);
	});

proposalRoute.route("/:proposalId")
	.get(async (req, res) => {
		let resBody = await proposalController.retrieveProposal(restMiddleware.parseRequest(req));
		res.send(resBody);
	});

export default proposalRoute;