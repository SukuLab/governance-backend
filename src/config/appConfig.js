import url from "url";
import appRootPath from "app-root-path";
let packageJson = require(appRootPath + "/package.json");
export default {
  app: {
    name: packageJson.name,
    version: packageJson.version,
    port: process.env.CR_API_URL ? url.parse(process.env.CR_API_URL).port : 8000,
    environment:
      process.env.CENTRAL_GOVERNANCE_ENVIRONMENT ? process.env.CENTRAL_GOVERNANCE_ENVIRONMENT : "production"
  },
  services: {
    auth: {
      baseUrl: process.env.CR_API_AUTH_URL
    },
    vault: {
      baseUrl: process.env.CR_API_VAULT_URL,
      connectionRetryIntervalInMs: 5000
    }
  },
  bc: {
    node: {
      public: {
        url: process.env.CR_BC_WSS_PUBLIC_NODE_URL,
        tokenContractAddress: process.env.CR_BC_TOKEN_CONTRACT_ADDRESS
      }
    }
  }
};
