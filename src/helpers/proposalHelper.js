import config from '../config/appConfig'
import proposalDal from "../dal/proposalDal";
import gov from '@suku/suku-governance-eth-lib';
const jsMath = Math;
const jsMathMax = Math.max;
let sukuLogger = require('@suku/suku-logging')(config.app);
const proposalHelper = new Object();


const sukuTokenContactAddress = config.bc.node.public.tokenContractAddress;
const BcURL = config.bc.node.public.url;

sukuLogger.debug('sukuTokenContactAddress : ' + sukuTokenContactAddress);
sukuLogger.debug('public node url : ' + BcURL);

let EthGovernance = new gov(sukuTokenContactAddress, BcURL);



proposalHelper.fetchEthBlockHeight = async () => {
  return await EthGovernance.getBlockNumber();
}

/* Procedure functionality has to be verified by testing */
const asyncVoteCountUpdate = (proposalId) => {

  proposalDal.callbackFetch(proposalId, (proposal) => {

    if(proposal === null){
      sukuLogger.warning('proposal is null @asyncVoteCountUpdate');      
    }

    if(proposal) {

      let proposalVotes = proposal.votes ? proposal.votes : [];

      if(proposalVotes.length > 0) {

        sukuLogger.info('Iterating prooposal: ' + proposal.proposalId + ' votes for update @asyncVoteCountUpdate');
        proposalVotes.forEach(async (vote) => {

          let tokenBalance = await EthGovernance.getTokenBalance(vote['_id'], proposal.blockExpiration);
          
          let updateConstraints = { 'proposalId': proposal.proposalId, 'votes._id': vote['_id'] };
          let updateInfo = { "$set": { 'votes.$.votes' : tokenBalance } };
          let updateVotesDalResult = await proposalDal.update(updateConstraints, updateInfo);
          sukuLogger.info('Vote updated status @asyncVoteCountUpdate ' + updateVotesDalResult.status);
          if(updateVotesDalResult.status){
            sukuLogger.info("updated vote for proposalId : " + proposal.proposalId);
          }

        });

      } else {
        sukuLogger.info('Proposal: ' + proposal.proposalId + ' donot contain any votes @asyncVoteCountUpdate');
      }

    }

  });

}


const updateWinChoiceAmongProposalChoices = async (proposalId, proposalChoices, highestVoteDetails) => {
  for(let i = 0; i < proposalChoices.length; i++){
    sukuLogger.info('Iterating through proposal choices @scanAndUpdateProposalChoiceForWin');
    let choice = proposalChoices[i];
    if(choice.choiceId == highestVoteDetails.choice) {
      sukuLogger.info('Found highest voted choice(' + highestVoteDetails.choiceId + ') for the proposal @scanAndUpdateProposalChoiceForWin for proposal ' + proposalId);

      let choiceUpdateDalRes = await proposalDal.update({ 'proposalId': proposalId, 'choices.choiceId': choice.choiceId }, {
        '$set': {
          'choices.$.choiceWinStatus': true
        }
      });

      sukuLogger.info('Highest voted choice update status : ' + choiceUpdateDalRes.status);
    }
  }
}

/*
  scanProposalVotesForWin: decides the winning proposal choice by extracting the 
  highest votes achieved for a choice.
 */
const scanAndUpdateProposalChoiceForWin = async (proposalId) => {
  try {
    sukuLogger.info('scanAndUpdateProposalChoiceForWin @proposalHelper invoked');


    let proposalFetchDalRes = await proposalDal.retrive(proposalId);
    if (proposalFetchDalRes.status){
      let proposalVotes = proposalFetchDalRes.data.votes;
      let proposalChoices = proposalFetchDalRes.data.choices;
      if(proposalVotes.length > 0){

        let highestVoteValue = jsMathMax.apply(jsMath, proposalVotes.map((vote) => {
          return vote.votes; 
        }));

        let highestVotes = proposalVotes.filter(vote => {
          return vote.votes == highestVoteValue ? vote : null;
        });

        sukuLogger.debug('Extracted highest votes set using highest vote value : ' + JSON.stringify(highestVotes));

        if (highestVotes.length > 1){
          sukuLogger.info('Multiple Highest votes exist @scanAndUpdateProposalChoiceForWin for proposal ' + proposalId);
          return false;
        }

        if (highestVotes.length > 0 && highestVotes.length < 2){
          let highestVoteDetails = highestVotes[0];
          await updateWinChoiceAmongProposalChoices(proposalId, proposalChoices, highestVoteDetails)
        }  
 
        return true;
      }

      sukuLogger.info('scanAndUpdateProposalChoiceForWin votes @proposalHelper, Votes not exist for the provided proposal ' + proposalId);
      return false;
    }

    sukuLogger.info('scanAndUpdateProposalChoiceForWin proposalFetch @proposalHelper, proposal fetch failed for proposalId : ' + proposalId);
    return false;

  } catch (error) {
    sukuLogger.error('scanAndUpdateProposalChoiceForWin @proposalHelper failed with error: ' + error.message);
    return false;
  }
}

/* check if the current ethereum block height reached the proposal blockExpiration, if so then update proposal expired to true 
  returns boolean(false) if proposal expired.  
  returns boolean(true) if unexpired proposal.  
*/

proposalHelper.verifyBlockHeight = async(proposalId, blockExpiration, proposalExpiryStatus) => {
  sukuLogger.info('Invoked verifyBlockHeight with inputs proposalId(' + proposalId + ') blockExpiration(' + blockExpiration + ') proposalExpiryStatus(' + proposalExpiryStatus + ')');
  if (proposalExpiryStatus == false){
    let EthblockHeight = await EthGovernance.getBlockNumber();
    sukuLogger.info("block height: " + EthblockHeight)
    sukuLogger.info("blockExpiration " + blockExpiration)
    if(EthblockHeight < blockExpiration){
      /* Proposal not expired */
      return true;
    }
    let constraints = { proposalId: proposalId };
    let currentDate = new Date();
    let dateExpired = currentDate.toISOString();

    let updateInfo = { "expired": true, 'dateExpired': dateExpired };
    let updateProposalDalRes = await proposalDal.update(constraints, updateInfo);
    if(updateProposalDalRes.status){
      sukuLogger.info("updated proposal propoerty exired to true for proposalId: " + proposalId);
      /* asyncVoteCountUpdate : Whenever we update the proposal to `{expired: true}`, we need to run through all the addresses in the proposal and update their balances reflected in the expiration blockheight. */
      asyncVoteCountUpdate(proposalId);
      await scanAndUpdateProposalChoiceForWin(proposalId);
    }
    /* Proposal expired */
    return false;
  }
  /* proposal already expired */ 
  return false;
}

proposalHelper.sukuTokenBalance = async (publicAddress) => {
  let tokenBalance = await EthGovernance.getTokenBalance(publicAddress);
  sukuLogger.info("tokenBalance: " + tokenBalance);
  return tokenBalance;
}


proposalHelper.signatureVerification = async (payload) => {
  let signatureVerificationStatus = await EthGovernance.verifyVote(payload.proposalId, payload.choiceId, payload.nonce, payload.signedMessage, payload.ethereumAddress);
  if(signatureVerificationStatus === false){
    return false;
  }
  return true;
}

export default proposalHelper;