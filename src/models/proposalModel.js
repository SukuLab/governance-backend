import mongoose from 'mongoose';
let Schema = mongoose.Schema;
/* eslint-disable require-unicode-regexp */
// Ethereum Address Regex
let addressRegex = /^(0[xX])([a-fA-F0-9]{40})$/;

let teamMemberSchema = new Schema({
  name: String,
  title: String,
  img: String,
  links: {
    linkedin: String,
    telegram: String,
    slack: String,
    github: String,
    twitter: String,
  },
});

let choiceSchema = new Schema({
  choiceId: String,
  title: String,
  description: String,
  sukuIncentice: Number,
  additionalInformation: String,
  team: [teamMemberSchema],
  img: String,
  choiceWinStatus: { type: Boolean, default: false }
});

let voteSchema = new Schema({
  _id: {
    type: String,
    match: addressRegex,
  },
  choice: {
    type: String,
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
    min: 0,
    // (Billion, into Wei)
    /* eslint-disable no-mixed-operators */
    max: 50 * 10 ** (9 + 18),
  },
});


let proposalSchema = new Schema({
  proposalId: String,
  title: String,
  author: String,
  body: String,
  sukuReward: Number,
  dateCreated: { type: Date, default: Date.now },
  dateExpired: { type: Date },
  expired: { type: Boolean, default: false },
  blockExpiration: {
    type: Number,
    required: [
      true,
      'An Ethereum Block number is required for the blockExpiration field.',
    ],
    min: 0,
  },
  // comments: [ { body: String, date: Date } ],
  choices: {
    type: [choiceSchema],
    min: 2,
  },
  votes: {
    type: [voteSchema],
    required: false,
    /*validate: [
      voteValidator,
      'The choice for this vote is not within range of the choices for this proposal.',
    ],*/
  },
});


// function that validate the startDate and endDate
/*
function voteValidator(vote) {
  let choice = vote.choice;
  let minVal = 0;
  // `this` is the mongoose document
  return (minVal <= choice && choice < this.choices.length);
}
*/

export default mongoose.model('proposal', proposalSchema);
