
import appHelper from '../helpers/appHelper';
import config from '../config/appConfig';
const defaultController = new Object();

defaultController.default = async () => {
	return await appHelper.apiResponse(200, 'default-route', {"version": config.app.version}, 'version-fetch-success');
}

defaultController.version = async () => {
  return await appHelper.apiResponse(200, 'successfully retrived current version', {"version": config.app.version }, 'version-fetch-success');
}
export default defaultController;