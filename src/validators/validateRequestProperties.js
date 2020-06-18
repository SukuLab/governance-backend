export default {
  Createnewproposal: [
    "proposalName",
    "proposalDescription",
    "proposalBlockExpiration",
    "sukuReward",
    "choices",
  ],
  proposalsStatus:[
    "unexpired",
    "all",
    "expired"
  ],
   proposalId:[
     "proposalId"
   ],
   retrieveAddressNonce:[
      "ethereumAddress"
   ],
   casteVote:[
     "proposalId",
     "choiceId",
     "address",
     "nonce",
     "signedMessage"
   ]
};
