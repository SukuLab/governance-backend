
import { fileUpload } from 'suku-utils';
import dynamicConfig from '../config/dynamicConfig';
import appHelper from '../helpers/appHelper';
var fileController = new Object();

fileController.saveImage = (req, callback) => {

  fileUpload.initialize({
    'mongo': dynamicConfig.config.mongodb.crgeneral,
  }, (returnObject) => {
    returnObject.saveFile(req.files, 'img_', (fileObject) => {
      let imageUploadResponse = {};
      if (fileObject.status) {
        imageUploadResponse = appHelper.apiResponse(200, fileObject.message, fileObject.data, "image-upload-success")
        return callback(imageUploadResponse);
      }

      imageUploadResponse = appHelper.apiResponse(400, fileObject.message, fileObject.data, "image-upload-failed");
      return callback(imageUploadResponse);

    });
  });
}

fileController.fetchImage = (req, callback) => {

  fileUpload.initialize({
    'mongo': dynamicConfig.config.mongodb.crgeneral,
  }, (returnObject) => {
    returnObject.fetchFile(req.query.imageId, (fileObject) => {
      let imageFetchResponse = {};
      if (fileObject.status) {
        imageFetchResponse = appHelper.apiResponse(200, fileObject.message, fileObject.data, "image-fetch-success");
        return callback(imageFetchResponse);
      }

      imageFetchResponse = appHelper.apiResponse(400, fileObject.message, fileObject.data, "image-fetch-failed");
      return callback(imageFetchResponse);

    });
  });

}

module.exports = fileController;