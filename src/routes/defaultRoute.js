import express from "express";
import defautController from "../controllers/defaultController";
import { restMiddleware } from 'suku-utils';
const defaultRoute = express.Router();

defaultRoute.route("/").get(async (req, res) => {
  let resBody = await defautController.default(restMiddleware.parseRequest(req));
  res.send(resBody);
});
defaultRoute.route("/version").get(async (req, res) => {
  let resBody = await defautController.version(restMiddleware.parseRequest(req));
  res.send(resBody);
});

export default defaultRoute;