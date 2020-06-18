import appConfig from "../config/appConfig";
import { curlRequest } from "suku-utils";
let sukuLogger = require('@suku/suku-logging')(appConfig.app);
const serviceBaseUrl = appConfig.services.vault.baseUrl;
export default {
  readVault: async path => {
    try {
      const endpoint = `${serviceBaseUrl}?path=${path}`;
      let readVaultRes = await curlRequest.sendRequest("get", endpoint, {}, {}, true);
      sukuLogger.debug("readVaultRes @service layer status" + readVaultRes.status);
      if (!readVaultRes.isError) {
        return {
          status: true,
          keyword: readVaultRes.body.status.keyword,
          data: readVaultRes.body.data
        };
      }
      return {
        status: false,
        keyword: readVaultRes.body.status.keyword ? readVaultRes.body.status.keyword : "rpc-error",
        data: readVaultRes.body.data
      };
    } catch (error) {
      return {
        status: false,
        keyword: "internal-error",
        data: {
          message: "Failed at readVaultRes with error " + error.message
        }
      };
    }
  }
};