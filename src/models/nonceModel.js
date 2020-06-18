import mongoose from 'mongoose';
let Schema = mongoose.Schema;
/* eslint-disable require-unicode-regexp */
let addressRegex = /^(0[xX])([a-fA-F0-9]{40})$/;

let nonceSchema = new Schema({
  _id: {
    type: String,
    match: addressRegex,
  },
  /* 0 is the nonce sent if there is no DB entry */
  nonce: { type: Number, default: 1, min: 1 }, 
});


export default mongoose.model('nonces', nonceSchema);