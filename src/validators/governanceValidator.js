/* eslint-disable require-unicode-regexp */
import genericValidator from "./genericValidator";
import validRequestProperties from "./validateRequestProperties";
import appConfig from '../config/appConfig';
let sukuLogger = require('@suku/suku-logging')(appConfig.app);
let governanceValidator = new Object();

governanceValidator.validateNewProposalRequest = inputRequest => {
  const validRequestKeysforcreateProposal = validRequestProperties.Createnewproposal;

  if (!genericValidator.checkIsObjectAndNotEmpty(inputRequest)) {
    sukuLogger.debug("create propose validation failed in checkIsObjectAndNotEmpty")
    return false;
  }

  if (genericValidator.checkIsInputObjectContainsUnknownKeys(Object.keys(inputRequest), validRequestKeysforcreateProposal)) {
    sukuLogger.debug("create propose validation failed in checkIsInputObjectContainsUnknownKeys")
    return false;
  }

  if (!genericValidator.checkIsString(inputRequest.proposalName) ||
    !genericValidator.checkIsString(inputRequest.proposalDescription) ||
    !genericValidator.checkIsNumber(inputRequest.proposalBlockExpiration) ||
    !genericValidator.checkIsNumber(inputRequest.sukuReward) ||
    !genericValidator.checkIsArrayAndNotEmpty(inputRequest.choices)) {
    sukuLogger.debug("create propose validation failed in checkIs Number/String/Array")
    return false;
  }

  if (!inputRequest.choices.length >= 2) {
    sukuLogger.debug("create propose validation failed in choice lentgh")
    return false;
  }

  if (genericValidator.checkUndefinedNullEmpty(inputRequest.proposalName)) {
    sukuLogger.debug("create propose validation failed in proposalName is Undefined/Null/Empty")
    return false;
  }

  if (genericValidator.checkUndefinedNullEmpty(inputRequest.proposalBlockExpiration)) {
    sukuLogger.debug("create propose validation failed in proposalBlockExpiration is Undefined/Null/Empty")
    return false;
  }

  if (genericValidator.checkUndefinedNullEmpty(inputRequest.sukuReward)) {
    sukuLogger.debug("create propose validation failed in sukuReward is Undefined/Null/Empty")
    return false;
  }

  return true;
};

governanceValidator.getArrayofProposal = inputRequest => {
  const validRequestproposalsStatus = validRequestProperties.proposalsStatus;

  if (inputRequest.status) {
    if (!genericValidator.checkIsString(inputRequest.status)) {
      sukuLogger.debug("GetArrayofProposal validation failed for status property in checkIs String")
      return false;
    }

    if (!genericValidator.includesIn(inputRequest.status, validRequestproposalsStatus)) {
      sukuLogger.debug("GetArrayofProposal validation failed in status check")
      return false;
    }
  }

  if (inputRequest.limit) {
    if (!genericValidator.checkIsNumber(inputRequest.limit)) {
      sukuLogger.debug("GetArrayofProposal validation failed for limit property in checkIs Number")
      return false;
    }
  }

  return true
}

governanceValidator.GetIndividualProposal = inputRequest => {
  const validRequestproposalId = validRequestProperties.proposalId;

  if (genericValidator.checkIsInputObjectContainsUnknownKeys(Object.keys(inputRequest), validRequestproposalId)) {
    sukuLogger.debug("GetIndividualProposal validation failed in checkIsInputObjectContainsUnknownKeys")
    return false;
  }
  if (!genericValidator.checkIsString(inputRequest.proposalId)) {
    sukuLogger.debug("GetIndividualProposal validation failed in proposalId checkIsString")
    return false;
  }
  return true
}

governanceValidator.GetAddressNonce = inputRequest => {
  const validNonceRetrievalParams = validRequestProperties.retrieveAddressNonce;
  const addressRegexPattern = /^(0[xX])([a-fA-F0-9]{40})$/;

  if (genericValidator.checkIsInputObjectContainsUnknownKeys(Object.keys(inputRequest), validNonceRetrievalParams)) {
    sukuLogger.debug("GetAddressNonce validation failed in checkIsInputObjectContainsUnknownKeys")
    return false;
  }
  if (!genericValidator.checkIsString(inputRequest.ethereumAddress)) {
    sukuLogger.debug("GetAddressNonce validation failed in ethereumAddress checkIsString")
    return false;
  }
  if (!inputRequest.ethereumAddress.match(addressRegexPattern)) {
    sukuLogger.debug("GetAddressNonce  validation failed address RgexPattern")
    return false;
  }
  return true
}

governanceValidator.castvote = inputRequest => {
  const addressRegexPattern = /^(0[xX])([a-fA-F0-9]{40})$/;
  const validRequestcasteVote = validRequestProperties.casteVote;

  if (!genericValidator.checkIsObjectAndNotEmpty(inputRequest)) {
    sukuLogger.debug("cast vote input  validation failed in checkIsObjectAndNotEmpty")
    return false;
  }
  if (genericValidator.checkIsInputObjectContainsUnknownKeys(Object.keys(inputRequest), validRequestcasteVote)) {
    sukuLogger.debug("cast vote input validation failed in checkIsInputObjectContainsUnknownKeys")
    return false;
  }

  if (!genericValidator.checkIsString(inputRequest.proposalId) ||
    !genericValidator.checkIsString(inputRequest.choiceId) ||
    !genericValidator.checkIsString(inputRequest.address) ||
    !genericValidator.checkIsNumber(inputRequest.nonce) ||
    !genericValidator.checkIsString(inputRequest.signedMessage)) {
    sukuLogger.debug("cast vote input validation failed in checkIs Number/String")
    return false;
  }

  if (inputRequest.proposalId.length != 36) {
    sukuLogger.debug("cast vote input validation failed proposalId length")
    return false;
  }

  if (inputRequest.choiceId.length != 36) {
    sukuLogger.debug("cast vote input validation failed choiceId length")
    return false;
  }

  if (!inputRequest.address.match(addressRegexPattern)) {
    sukuLogger.debug("cast vote input  validation failed address RgexPattern")
    return false;
  }

  return true
}

export default governanceValidator;