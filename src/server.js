"use strict";
import express from "express";
import morgan from "morgan";
import mongodbConnection from "./db/connection";
import config from "./config/appConfig";
import dynamicConfig from "./config/dynamicConfig";
import appRoute from "./routes/appRoute";
import bodyParser from "body-parser";
import mung from "express-mung";
import { restMiddleware } from "suku-utils";
import cors from "cors";
import path from "path";
import eventListenerHelper from './helpers/eventListenerHelper';
let sukuLogger = require('@suku/suku-logging')(config.app);

const bootServer = async () => {
  await dynamicConfig.loadConfig();
  let dynamicEnvironments = dynamicConfig.config;
  if (Object.keys(dynamicEnvironments).length == 0) {
    sukuLogger.warning("Unable to load dynamic configuration. server halted");
    return;
  }
  await mongodbConnection.establishConnection();

  const app = express();

  let loggerStream = {
    write: function(message){
      sukuLogger.info('morgan ' + message.substring(0, message.lastIndexOf('\n')));
    }
  };

  app.use(morgan("combined", { "stream": loggerStream }));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());

  app.use(express.static(__dirname + "/"));
  app.use(express.static(path.join(__dirname, "../public")));
  app.use(async (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Headers", "token");
    res.header("Access-Control-Max-Age", "3600");
    res.header("Access-Control-Allow-Credentials", true);
    next();
  });

  /*mung response intercept middleware*/
  app.use(
    mung.json(function transform(body, req, res) {
      /* adds mungMessage to every API response */
      body = restMiddleware.parseResponse(res, body);
      /* body.mungMessage = "I intercepted you!"; */
      return body;
    })
  );
  /*Routes initialize*/
  appRoute.initialize(app);
  /* port initialize */
  app.listen(config.app.port, () => {
    sukuLogger.info("server is listening on port " + config.app.port);
  });


  eventListenerHelper.registerOnstartEventListeners((eventListenerResisterMsg) => {
    sukuLogger.info(eventListenerResisterMsg);
  });
};

bootServer();