import appConfig from "../config/appConfig";
import { curlRequest } from "suku-utils";
import jwt from "jsonwebtoken";
let sukuLogger = require('@suku/suku-logging')(appConfig.app);
const serviceBaseUrl = appConfig.services.auth.baseUrl;
const tokenTypes = ["jwt2"];

export default {

  verifyToken: async token => {
    try {
      sukuLogger.info(token);
      let tokenDecoded = jwt.decode(token, { complete: true });
      let options = { headers: { token } };
      if (!tokenDecoded) {
        throw Error("Token Decoding Failed");
      }
      if (!tokenDecoded.payload) {
        throw Error("Token Payload Not Set");
      }
      if (!tokenDecoded.payload.type) {
        throw Error("Token Type Not Set");
      }
      if (tokenTypes.indexOf(tokenDecoded.payload.type) === -1) {
        throw Error("Invalid Token Type");
      }

      if (tokenDecoded.payload.type == "jwt2") {
        const endpoint = `${serviceBaseUrl}node/jwt/verify`;
        sukuLogger.debug("endpoint.." + endpoint)
        let serviceResponse = await curlRequest.sendRequest("get", endpoint, options, {}, true);
        sukuLogger.info("jwt2 from onboardingAuth Curl Req Res " + JSON.stringify(serviceResponse));
        if (!serviceResponse.isError) {
          return {
            status: true,
            keyword: "success",
            data: serviceResponse.body
          };
        }
        throw Error("Token Verification Failed");
      }

      throw Error("Invalid JWT Type");
    } catch (error) {
      sukuLogger.error("verifyToken" + error.message);
      if (error.name == "Error") {
        return {
          status: false,
          keyword: "client-side-error",
          data: {
            message: "Failed at jwt verification with error " + error.message
          }
        };
      }
      return {
        status: false,
        keyword: "internal-error",
        data: {
          message: "Failed at jwt verification with error " + error.message
        }
      };
    }
  }
};
