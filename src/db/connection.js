import mongoose from "mongoose";
import config from '../config/appConfig'
import dynamicConfig from "../config/dynamicConfig";
let sukuLogger = require('@suku/suku-logging')(config.app);
const retryIntervalInMS = 5000;

const options = {
  useNewUrlParser: true,
  autoIndex: false,
  reconnectTries: 30,
  reconnectInterval: 500,
  poolSize: 10,
  bufferMaxEntries: 0
};

const establishConnection = async () => {
  const dburl = dynamicConfig.config.mongodb.sukuGovernance;
  sukuLogger.info("MongoDB url " + dburl);
  sukuLogger.info("MongoDB connection Initiated");
  mongoose
    .connect(dburl, options)
    .then(() => {
      sukuLogger.info("MongoDB is connected");
    })
    .catch(err => {
      sukuLogger.error(err.message ? err.message : "Mongodb connection error");
      sukuLogger.warning(
        "MongoDB Connection Failed, retrying in " + retryIntervalInMS + " ms"
      );
      setTimeout(establishConnection, retryIntervalInMS);
    });
};

process.on("SIGINT", function() {
  mongoose.connection.close(function() {
    sukuLogger.info(
      "Mongoose default connection disconnected through app termination"
    );
    process.exit(0);
  });
});

export default {
  "establishConnection": establishConnection
};
