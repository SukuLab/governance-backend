/* eslint-disable max-lines */
import proposalDal from "../dal/proposalDal";
import governanceValidator from "../validators/governanceValidator";
import appHelper from "../helpers/appHelper";
import nonceHelper from '../helpers/nonceHelper';
import proposalHelper from "../helpers/proposalHelper";
import { guid } from "suku-utils";
import nonceController from './nonceController';
import config from '../config/appConfig';
let sukuLogger = require('@suku/suku-logging')(config.app);

let proposalController = new Object();

proposalController.createNewProposal = async request => {
  try {
    if (!governanceValidator.validateNewProposalRequest(request.body)) {
      return appHelper.apiResponse(400, "invalid-request", {}, 'invalid-request');
    }

    let proposal = {
      proposalId: guid.generateGUID(),
      title: request.body.proposalName,
      author: request.body.author ? request.body.author : '',
      body: request.body.proposalDescription,
      sukuReward: request.body.sukuReward,
      blockExpiration: request.body.proposalBlockExpiration,
      choices: request.body.choices
    };

    if (proposal.choices.length < 2) {
      return appHelper.apiResponse(400, 'Proposal must contain atleast two choices', {}, 'lack-of-choices');
    }

    proposal.choices = proposal.choices.map(choice => {
      return {
        choiceId: guid.generateGUID(),
        title: choice.name,
        description: choice.description,
        sukuIncentice: choice.sukuIncentice ? choice.sukuIncentice : 0,
        additionalInformation: choice.additionalInformation ? choice.additionalInformation : "",
        team: choice.team ? choice.team : [],
        img: choice.img ? choice.img : ""
      };
    });

    let proposalDalResponse = await proposalDal.submit(proposal);

    if (proposalDalResponse.status && proposalDalResponse.data !== null) {
      return appHelper.apiResponse(200, 'success', {
        "proposalId": proposalDalResponse.data.proposalId,
        "proposalName": proposalDalResponse.data.title
      }, 'proposal-submit-success');
    }

    return appHelper.apiResponse(500, 'internal-error', {}, 'internal-error');

  } catch (error) {
    sukuLogger.error('Submit proposal failed with error : ' + error.message);
    return appHelper.apiResponse(500, 'internal-error', {}, 'internal-error');
  }
}

proposalController.retrieveProposal = async (request) => {
  try {

    if (!governanceValidator.GetIndividualProposal(request.params)) {
      return appHelper.apiResponse(400, 'invalid-request', {}, 'invalid-request');
    }

    let proposalId = request.params.proposalId;
    sukuLogger.info('proposalId : ' + proposalId);
    let proposalDalResponse = await proposalDal.retrive(proposalId);
    sukuLogger.info('proposalDalResponse : retrieve individual proposal dal status : ' + proposalDalResponse.status);
    if (proposalDalResponse.status && proposalDalResponse.data !== null) {

      let blockExpiration = proposalDalResponse.data.blockExpiration;
      let expiryStatus = proposalDalResponse.data.expired;


      /* VERIFY PROPOSAL BLOCK HEIGHT */
      let verifyBlockHeightStatus = await proposalHelper.verifyBlockHeight(proposalId, blockExpiration, expiryStatus);

      if (verifyBlockHeightStatus === false) {
        /* current ethereum blockheight reached blockExpiration hence re-fetch the proposal information for the updated expiry status */
        sukuLogger.info('proposal(' + proposalId + ') expired');
        proposalDalResponse = await proposalDal.retrive(proposalId);

        if (proposalDalResponse.status === false) {
          sukuLogger.warning('Proposal re-fetch (fetch after proposal expiry status update) operation failed. Expiry status in response may be not be accurate');
        }
      }

      let choices = proposalDalResponse.data.choices;
      proposalDalResponse.data.choices = [];
      proposalDalResponse.data.choices = choices.map(choice => {
        return {
          'choiceId': choice.choiceId,
          'name': choice.title,
          'description': choice.description,
          'sukuIncentice': choice.sukuIncentice ? choice.sukuIncentice : 0,
          'additionalInformation': choice.additionalInformation ? choice.additionalInformation : "",
          'teamMembers': choice.team,
          'img': choice.img ? choice.img : "",
          'choiceWinStatus': choice.choiceWinStatus
        }
      });

      let ethBlockHeight = await proposalHelper.fetchEthBlockHeight();
      return appHelper.apiResponse(200, 'success', {
        "blockHeight": ethBlockHeight,
        "proposal": proposalDalResponse.data
      }, 'proposal-fetch-success');
    }

    if (proposalDalResponse.status && proposalDalResponse.data === null) {
      return appHelper.apiResponse(404, 'resource-not-found', {}, 'proposal-not-found');
    }

    return appHelper.apiResponse(500, 'internal-error', {}, 'internal-error');
  } catch (error) {
    sukuLogger.error('Retrieve proposal failed with error : ' + error.message);
    return appHelper.apiResponse(500, 'internal-error', {}, 'internal-error');
  }
}

// eslint-disable-next-line complexity
proposalController.retrieveAllProposal = async (request) => {
  try {
    let ethBlockHeight = await proposalHelper.fetchEthBlockHeight();
    const queryInput = request.query;

    let proposalDalResponseWithoutFilter = await proposalDal.retrieveProposals();

    sukuLogger.info('Retrieve all proposal without filter dal response status: ' + proposalDalResponseWithoutFilter.status);
    if (proposalDalResponseWithoutFilter.status && proposalDalResponseWithoutFilter.data !== null) {
      for (let p = 0; p < proposalDalResponseWithoutFilter.data.length; p++) {

        let proposal = proposalDalResponseWithoutFilter.data[p];
        /* VERIFY PROPOSAL BLOCK HEIGHT */
        let verifyBlockHeightStatus = await proposalHelper.verifyBlockHeight(proposal.proposalId, proposal.blockExpiration, proposal.expired);

        if (verifyBlockHeightStatus === false) {
          /* current ethereum blockheight reached blockExpiration hence re-fetch the proposal information for the updated expiry status */
          sukuLogger.info('proposal (' + proposal.proposalId + ') verifyBlockHeight status : ' + verifyBlockHeightStatus);
        }
      }
    }

    let queryObject = {};


    if (typeof queryInput.active !== 'undefined' && typeof queryInput.completed !== 'undefined') {

      if (parseInt(queryInput.active) == 1 && parseInt(queryInput.completed) == 0) {
        queryObject.expired = false;
      } else if (parseInt(queryInput.active) == 0 && parseInt(queryInput.completed) == 1) {
        queryObject.expired = true;
      }

    }

    if (queryInput.status) {
      if (queryInput.status == 'expired') {
        queryObject.expired = true;
      }

      if (queryInput.status == 'unexpired') {
        queryObject.expired = false;
      }
    }

    if (typeof queryInput.voted != 'undefined' && typeof queryInput.notvoted != 'undefined' && typeof queryInput.address != 'undefined') {
      if (parseInt(queryInput.voted) == 1 && parseInt(queryInput.notvoted) == 0) {
        queryObject['votes._id'] = { '$eq': queryInput.address };
      } else if (parseInt(queryInput.voted) == 0 && parseInt(queryInput.notvoted) == 1) {
        queryObject['votes._id'] = { '$ne': queryInput.address };
      }
    }

    if (queryInput.fromDate && queryInput.toDate) {
      queryObject.dateCreated = { '$gte': queryInput.fromDate, '$lte': queryInput.toDate };
    } else if (queryInput.fromDate && !queryInput.toDate) {
      queryObject.dateCreated = { '$gte': queryInput.fromDate };
    } else if (!queryInput.fromDate && queryInput.toDate) {
      queryObject.dateCreated = { '$lte': queryInput.toDate };
    }

    sukuLogger.info('Proposal retrieval query string : ' + JSON.stringify(queryInput));
    sukuLogger.info('Proposal retrieval formatted query object : ' + JSON.stringify(queryObject));

    if (!governanceValidator.getArrayofProposal(queryObject)) {
      return appHelper.apiResponse(400, 'invalid-request', {}, 'invalid-request');
    }

    let proposalDalResponse = await proposalDal.retriveAll(queryObject, {});
    sukuLogger.info('Retrieve all proposal dal response status: ' + proposalDalResponse.status);
    if (proposalDalResponse.status && proposalDalResponse.data !== null) {

      proposalDalResponse.data = proposalDalResponse.data.map(proposal => {

        let votedChoiceId = "";

        if (typeof queryInput.address != 'undefined') {
          let votedVotesList = proposal.votes.map(vote => {
            let votedInfo = {};
            if (vote['_id'] == queryInput.address) {

              proposal.choices.filter((choice) => {
                if (choice.choiceId == vote['choice']) {
                  votedChoiceId = choice.choiceId;
                }

                return true;
              });

              votedInfo = vote;
            }
            
            return votedInfo;
          });

          if (votedVotesList.length > 0) {
            proposal.voted = true;
          } else {
            proposal.voted = false;
          }
        }

        proposal.choices = proposal.choices.map(choice => {
          let mappedChoiceInfo = {
            'choiceId': choice.choiceId,
            'name': choice.title,
            'description': choice.description,
            'sukuIncentice': choice.sukuIncentice ? choice.sukuIncentice : 0,
            'additionalInformation': choice.additionalInformation ? choice.additionalInformation : "",
            'teamMembers': choice.team,
            'img': choice.img ? choice.img : "",
            'choiceWinStatus': choice.choiceWinStatus
          };

          if (typeof queryInput.address != 'undefined') {
            if (votedChoiceId == choice.choiceId) {
              mappedChoiceInfo.choiceVoted = true;
            } else {
              mappedChoiceInfo.choiceVoted = false;
            }
          }
          return mappedChoiceInfo;
        });


        if (ethBlockHeight <= proposal.blockExpiration) {
          proposal.blocksUntilExpiry = proposal.blockExpiration - ethBlockHeight;
        } else {
          proposal.blocksUntilExpiry = 0;
        }


        return proposal;
      });


      return appHelper.apiResponse(200, 'success', {
        "blockHeight": ethBlockHeight,
        "proposals": proposalDalResponse.data
      }, 'proposals-fetch-success');

    }

    if (proposalDalResponse.status && proposalDalResponse.data === null) {
      return appHelper.apiResponse(404, 'resource-not-found', {}, 'proposals-not-found');
    }

    return appHelper.apiResponse(500, 'internal-error', {}, 'internal-error');

  } catch (error) {
    sukuLogger.error('Retrieve all proposals failed with error : ' + error.message);
    return appHelper.apiResponse(500, 'internal-error', {}, 'internal-error');
  }

}

proposalController.castvote = async request => {
  try {
    /* Input validation */
    if (!governanceValidator.castvote(request.body)) {
      sukuLogger.debug("input validation failed")
      return appHelper.apiResponse(400, "invalid-request", {}, 'invalid-request');
    }

    const vote = {
      'proposalId': request.params.proposalId,
      'choiceId': request.body.choiceId,
      'ethereumAddress': request.body.address,
      'signedMessage': request.body.signedMessage,
      'nonce': request.body.nonce
    };

    /* ProposalId validation */
    let proposalDalResponse = await proposalDal.retrive(vote.proposalId);
    if (proposalDalResponse.status && proposalDalResponse.data === null) {
      sukuLogger.debug("proposalId validation failed")
      return appHelper.apiResponse(404, "proposal Id " + vote.proposalId + " was not found", {}, 'proposal-notfound');
    }

    const proposalInfo = proposalDalResponse.data;

    /* choiceId validation */
    let checkchoiceId = proposalInfo.choices.filter(function (el) {
      return el.choiceId === vote.choiceId;
    });

    sukuLogger.debug("Filtered choices " + JSON.stringify(checkchoiceId));

    if (checkchoiceId.length === 0) {
      sukuLogger.debug("choiceId validation failed")
      return appHelper.apiResponse(404, "choice Id " + vote.choiceId + " was not found", {}, 'choice-notfound');
    }

    /* blockHeight validation */
    let verifyBlockHeightStatus = await proposalHelper.verifyBlockHeight(proposalInfo.proposalId, proposalInfo.blockExpiration, proposalInfo.expired);
    if (verifyBlockHeightStatus === false) {
      sukuLogger.debug("verifyBlockHeight validation failed")
      return appHelper.apiResponse(400, "Proposal is Expired. Cast Vote not allowed", {}, 'proposal-expired');
    }


    /* Get suku-token */
    let sukuTokenBalance = await proposalHelper.sukuTokenBalance(vote.ethereumAddress);


    /* cast vote verification : nonce */
    let nonceVerificationStatus = await nonceHelper.verifyNonce(vote.ethereumAddress, vote.nonce);
    if (nonceVerificationStatus === false) {
      sukuLogger.debug("Invalid nonce for address")
      return appHelper.apiResponse(403, "Invalid nonce for address " + vote.ethereumAddress, {}, 'invalid-nonce');
    }

    /* cast vote verification : signature */
    let signatureVerificationStatus = await proposalHelper.signatureVerification(vote);
    if (signatureVerificationStatus === false) {
      sukuLogger.debug("Invalid signature for address")
      return appHelper.apiResponse(403, "Invalid signature for address " + vote.ethereumAddress, {}, 'invalid-signature');
    }

    /* Update nonce or create nonce entry if first time voting */
    let nonceControllerInsertStatus = await nonceController.insertAddressNonce({
      "ethereumAddress": vote.ethereumAddress,
      "nonce": vote.nonce
    });

    if (nonceControllerInsertStatus === true) {

      let votes = proposalInfo.votes.filter(function (el) {
        return (el['_id'] === vote.ethereumAddress);
      });

      let voteUpdateResponse = {
        status: false,
        data: {}
      };

      if (votes.length > 0) {
        sukuLogger.debug("Vote already exist for the address, update vote")

        sukuLogger.debug('votes ..', JSON.stringify(votes));
        let existingVoteInfo = votes[0];
        let constraints = {
          'proposalId': vote.proposalId,
          'votes._id': existingVoteInfo._id
        };
        let updateInfo = {
          "votes.$.choice": vote.choiceId,
          "votes.$.votes": sukuTokenBalance,
        };

        voteUpdateResponse = await proposalDal.update(constraints, updateInfo);
      }

      if (votes.length == 0) {
        sukuLogger.debug("New vote");

        let constraints = { proposalId: vote.proposalId };
        let updateInfo = {
          $push: {
            "votes": [{
              "_id": vote.ethereumAddress,
              "choice": vote.choiceId,
              "votes": sukuTokenBalance
            }]
          }
        };


        voteUpdateResponse = await proposalDal.update(constraints, updateInfo);
      }

      sukuLogger.debug("vote update response" + JSON.stringify(voteUpdateResponse))
      if (voteUpdateResponse.status) {
        return appHelper.apiResponse(200, "The vote has been successfully cast!", {}, 'vote-success');
      }

      return appHelper.apiResponse(500, "Unable to cast vote", {}, 'vote-failed');
    }

    if (nonceControllerInsertStatus === false) {
      return appHelper.apiResponse(500, "nonce upsert logic failed", {}, 'nonce-error')
    }

    return appHelper.apiResponse(500, "Unable to cast vote", {}, 'internal-error');

  } catch (error) {
    sukuLogger.error("castvote failed with error : " + error.message);
    return appHelper.apiResponse(500, "castvote failed with error : " + error.message, {}, 'internal-error');
  }
};

export default proposalController;