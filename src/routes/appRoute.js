import defaultRoute from './defaultRoute';
import proposalRoute from './proposalRoute';
import nonceRoute from './nonceRoute';
import authService from '../services/authService';
import appHelper from '../helpers/appHelper';
import appConfig from '../config/appConfig';
import fileUpload from 'express-fileupload';
import fileRoute from './fileRoute';
let sukuLogger = require('@suku/suku-logging')(appConfig.app);



let appRoute = new Object();
let middleware = async (req, res, next) => {

  if (appConfig.app.environment != "development" && appConfig.app.environment != "production") {
    try {
      let token = req.headers.token;
      if (token === undefined || token === null || token === "") {
        sukuLogger.warning('Bad Request. Please provide authorization token in the header');
        return res.send(appHelper.apiResponse(400, 'invalid-request', {}));
      }

      let onboardingAuthServiceStatus = await authService.verifyToken(token);
      sukuLogger.info("Auth status" + JSON.stringify(onboardingAuthServiceStatus));
      if (onboardingAuthServiceStatus.status === true) {
        sukuLogger.info("Token Verification success");
        return next();
      } 
      
      sukuLogger.error("Token Verification failed");
      return res.send(appHelper.apiResponse(401, 'unauthorized-access', {}));
      
    } catch (error) {
      sukuLogger.error("Token Verification failed error" + JSON.stringify(error.message));
      return res.send(appHelper.apiResponse(401, 'unauthorized-access', {message: "Authentication failed with error : " + error.message}));
    }
  }

  return next();
};

appRoute.initialize = app => {
  /*default route*/
  app.use("/", defaultRoute);

  /*proposal route*/
  app.use('/proposals', middleware, proposalRoute);

  /*nonce route*/
  app.use('/nonce', middleware, nonceRoute);

  /** Express FileUpload is required for reading file post */
  app.use(fileUpload());
  app.use('/file', middleware, fileRoute);

};

export default appRoute;