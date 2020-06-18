import proposalModel from '../models/proposalModel';
import config from '../config/appConfig'
let sukuLogger = require('@suku/suku-logging')(config.app);
const proposalDal = new Object();

proposalDal.submit = async (proposal) => {
  try {

    let documentSaveObject = new proposalModel(proposal);
    let documentSaveDalResponse = await documentSaveObject.save();
    return { "status": true, "data": documentSaveDalResponse };
  } catch (error) {
    sukuLogger.error('Submit proposal dal failed with error : ' + error.message);
    return { "status": false, "data": error.message }
  }
}

proposalDal.retrive = async (documentReference) => {
  try {
    let proposal = await proposalModel.findOne({ 'proposalId': documentReference }, { '_id': 0, '__v': 0 }).lean();
    return { "status": true, "data": proposal };
  } catch (error) {
    sukuLogger.error('Retrieve proposal dal failed with error : ' + error.message);
    return { "status": false, "data": error.message }
  }
}


proposalDal.callbackFetch = (proposalId, callback) => {
  proposalModel.findOne({ 'proposalId': proposalId }, (err, proposal) => {
    if (!err){
      sukuLogger.info("proposalDal asyncRetrive is success");
      return callback(proposal);
    } 

    sukuLogger.error("proposalDal asyncRetrive failed with error : " + err.message);
    return callback(null);

  });
}

proposalDal.retrieveProposals = async () => {
  try {
    let projection = { '_id': 0, '__v': 0 };
    let proposals = await proposalModel.find({}, projection).lean();
    return { "status": true, "data": proposals };
  } catch (error) {
    sukuLogger.error('retrieveProposals dal failed with error : ' + error.message);
    return { "status": false, "data": error.message }
  }
}

proposalDal.retriveAll = async (queryObject, sortObject, limit) => {
  try {
    let constraints = queryObject ? queryObject : {};
    let limitProposals = limit ? parseInt(limit) : 5;
    
    /* reason for disabling rule for the variable sortByColumn : The variable is used below as a key but not involved in any assingment statments, which is considered as unused by eslint */
    // eslint-disable-next-line no-unused-vars
    let sortByColumn = sortObject.sortBy ? sortObject.sortBy : "_id";
    let sortOrder = sortObject.sortOrder ? sortObject.sortOrder : -1;
    let projection = { '_id': 0, '__v': 0 };
    sukuLogger.debug('Retrieve all proposal sorting params ' + JSON.stringify(sortObject));
    let proposals = await proposalModel.find(constraints, projection).lean().sort({ sortByColumn : sortOrder }).limit(limitProposals);
    return { "status": true, "data": proposals };
  } catch (error) {
    sukuLogger.error('Retrieve all proposal dal failed with error : ' + error.message);
    return { "status": false, "data": error.message }
  }
}

proposalDal.update = async (constraints, updateInfo) => {
  try {
    let updatedata = await proposalModel.findOneAndUpdate(constraints, updateInfo, { 'new': true });
    return { "status": true, "data": updatedata };
  } catch (error) {
    sukuLogger.error('update dal failed with error : ' + error.message);
    return { "status": false, "data": error.message }
  }
}

export default proposalDal;