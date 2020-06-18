"use strict";
import chai from "chai";
import chaiHttp from "chai-http";
import appRootPath from 'app-root-path';
const governanceValidator = require(appRootPath + "/src/validators/governanceValidator").default;
const expect = chai.expect;
chai.use(chaiHttp);

/* Create new proposal POST input validation */
describe("Create new proposal (POST) input validation", function () {

  let newProposalInput = function () {
    return {
      proposalName: "proposal name",
      proposalDescription: "proposal description",
      proposalBlockExpiration: 154544,
      sukuReward: 12,
      choices: [
        {
          name: "choice1",
          description: "choice 1 description"
        },
        {
          name: "choice 2",
          description: "choice 2 description"
        }
      ]
    };
  };

  /* negative test case */
  describe("Negative test cases", function () {
    it("-should be false when none of the required input parameters is supplied", async function () {
      let inputNT01 = {};
      let result = governanceValidator.validateNewProposalRequest(inputNT01);
      expect(result).to.equal(false);
    });

    it("-should be false when unknown input parameters are supplied", async function () {
      let inputNT02 = newProposalInput();
      inputNT02["unkown"] = "unkown";
      let result = governanceValidator.validateNewProposalRequest(inputNT02);
      expect(result).to.equal(false);
    });

    it("-should be false when choices input parameter is an empty array", async function () {
      let inputNT03 = newProposalInput();
      inputNT03["choices"] = [];
      let result = governanceValidator.validateNewProposalRequest(inputNT03);
      expect(result).to.equal(false);
    });

    it("-should be false when choices input parameter array length is less than 2", async function () {
      let inputNT04 = newProposalInput();
      inputNT04["choices"] = inputNT04.choices[0];
      let result = governanceValidator.validateNewProposalRequest(inputNT04);
      expect(result).to.equal(false);
    });

    it("-should be false when proposalName empty/undefined/null", async function () {
      let inputNT05 = newProposalInput();
      inputNT05["proposalName"] = '';
      let result = governanceValidator.validateNewProposalRequest(inputNT05);
      expect(result).to.equal(false);
    });

    it("-should be false when proposalBlockExpiration empty/undefined/null", async function () {
      let inputNT06 = newProposalInput();
      inputNT06["proposalBlockExpiration"] = '';
      let result = governanceValidator.validateNewProposalRequest(inputNT06);
      expect(result).to.equal(false);
    });
  });

  /* positive test case */
  describe("Positive test cases", function () {
    it("-should be true when input is valid", async function () {
      let inputPT01 = newProposalInput();
      let result = governanceValidator.validateNewProposalRequest(inputPT01);
      expect(result).to.equal(true);
    });

    it("-should be true when new input parameters is Not supplied", async function () {
      let inputPT02 = newProposalInput();
      let result = governanceValidator.validateNewProposalRequest(inputPT02);
      expect(result).to.equal(true);
    });

    it("-should be true when choices input parameter is not an empty array", async function () {
      let inputPT03 = newProposalInput();
      let result = governanceValidator.validateNewProposalRequest(inputPT03);
      expect(result).to.equal(true);
    });

    it("-should be true when choices input parameter array length is more than or equal to 2", async function () {
      let inputPT04 = newProposalInput();
      let result = governanceValidator.validateNewProposalRequest(inputPT04);
      expect(result).to.equal(true);
    });

    it("-should be true when proposalName Not empty/undefined/null", async function () {
      let inputPT05 = newProposalInput();
      let result = governanceValidator.validateNewProposalRequest(inputPT05);
      expect(result).to.equal(true);
    });

    it("-should be true when proposalBlockExpiration empty/undefined/null", async function () {
      let inputPT06 = newProposalInput();
      let result = governanceValidator.validateNewProposalRequest(inputPT06);
      expect(result).to.equal(true);
    });
  });
});

/*Obtain Array of proposals*/
describe("Obtain Array of proposals (GET) input validation", function () {
  let getArrayProposals = function () {
    return {
      status: "unexpired",
      limit: 1
    };
  };
  /* negative test case */
  describe("Negative test cases", function () {
    it("-should be false when you supplied invalid status", async function () {
      let inputNT01 = getArrayProposals();
      inputNT01['status'] = 'active';
      let result = governanceValidator.getArrayofProposal(inputNT01);
      expect(result).to.equal(false);
    });

    it("-should be false when you supplied invalid limit", async function () {
      let inputNT02 = getArrayProposals();
      inputNT02['limit'] = '1';
      let result = governanceValidator.getArrayofProposal(inputNT02);
      expect(result).to.equal(false);
    });

  });

  /* positive test case */
  describe("Positive test cases", function () {
    it("-should be true when you supplied valid status", async function () {
      let inputPT01 = getArrayProposals();
      let result = governanceValidator.getArrayofProposal(inputPT01);
      expect(result).to.equal(true);
    });

    it("-should be true when you supplied valid limit", async function () {
      let inputPT02 = getArrayProposals();
      let result = governanceValidator.getArrayofProposal(inputPT02);
      expect(result).to.equal(true);
    });
  });
});

/*Obtain individual proposal */
describe("Obtain individual proposal (GET) input validation", function () {
  let getindividualproposal = function () {
    return {
      proposalId: '123',
    };
  };
  /* negative test case */
  describe("Negative test cases", function () {

    it("-should be false when you supplied invalid proposalId parameter", async function () {
      let inputNT03 = getindividualproposal();
      inputNT03['proposalId'] = 123;
      let result = governanceValidator.GetIndividualProposal(inputNT03);
      expect(result).to.equal(false);
    });

    it("-should be false when you supplied unkown parameter", async function () {
      let inputNT02 = getindividualproposal();
      inputNT02['unkown'] = 'unkown'
      let result = governanceValidator.GetIndividualProposal(inputNT02);
      expect(result).to.equal(false);
    });
  });

  /* positive test case */
  describe("Positive test cases", function () {
    it("-should be true when you supplied valid proposalId parameter", async function () {
      let inputPT01 = getindividualproposal();
      let result = governanceValidator.GetIndividualProposal(inputPT01);
      expect(result).to.equal(true);
    });

    it("-should be true when you have not supplied any unkown parameter", async function () {
      let inputNT02 = getindividualproposal();
      let result = governanceValidator.GetIndividualProposal(inputNT02);
      expect(result).to.equal(true);
    });

  });
});

/*Caste vote */
describe("Caste vote (Post) input validation", function () {
  let castevote = function () {
    return {
      "proposalId": "30295580-81b3-86ce-22f7-d97db1076837",
      "choiceId": "b7ad06b6-57ad-84c5-f073-ac5a16030018",
      "address": "0x880aBa1911749C24189Dc72B238B20E9AD8E36E3",
      "nonce": 4545,
      "signedMessage": "dsdvsds"
    };
  };
  /* negative test case */
  describe("Negative test cases", function () {

    it("-should be false when none of the required input parameters is supplied", async function () {
      let inputNT03 = {}
      let result = governanceValidator.castvote(inputNT03);
      expect(result).to.equal(false);
    });
    it("-should be false when unknown input parameters are supplied", async function () {
      let inputNT02 = castevote();
      inputNT02["unkown"] = "unkown";
      let result = governanceValidator.castvote(inputNT02);
      expect(result).to.equal(false);
    });
    it("-should be false when nonce input parameters is string", async function () {
      let inputNT03 = castevote();
      inputNT03["nonce"] = "123nonce";
      let result = governanceValidator.castvote(inputNT03);
      expect(result).to.equal(false);
    });
    it("-should be false when address input parameters is not in regex pattern", async function () {
      let inputNT04 = castevote();
      inputNT04["address"] = "123456789";
      let result = governanceValidator.castvote(inputNT04);
      expect(result).to.equal(false);
    });
    it("-should be false when proposalId input parameters length less than 36", async function () {
      let inputNT05 = castevote();
      inputNT05["proposalId"] = "30295580-81b3-86ce-22f7-d97db10768";
      let result = governanceValidator.castvote(inputNT05);
      expect(result).to.equal(false);
    });
    it("-should be false when proposalId input parameters length greater than 36", async function () {
      let inputNT06 = castevote();
      inputNT06["proposalId"] = "30295580-81b3-86ce-22f7-d97db1076823-897";
      let result = governanceValidator.castvote(inputNT06);
      expect(result).to.equal(false);
    });
    it("-should be false when choiceId input parameters length less than 36", async function () {
      let inputNT07 = castevote();
      inputNT07["choiceId"] = "30295580-81b3-86ce-22f7-d97db10768";
      let result = governanceValidator.castvote(inputNT07);
      expect(result).to.equal(false);
    });
    it("-should be false when choiceId input parameters length greater than 36", async function () {
      let inputNT08 = castevote();
      inputNT08["choiceId"] = "30295580-81b3-86ce-22f7-d97db1076823-897";
      let result = governanceValidator.castvote(inputNT08);
      expect(result).to.equal(false);
    });
  });

  /* positive test case */
  describe("Positive test cases", function () {
    it("-should be true when you supplied valid input", async function () {
      let inputPT01 = castevote();
      let result = governanceValidator.castvote(inputPT01);
      expect(result).to.equal(true);
    });
    it("-should be true when unknown input parameters are not supplied", async function () {
      let inputPT02 = castevote();
      let result = governanceValidator.castvote(inputPT02);
      expect(result).to.equal(true);
    });
    it("-should be true when nonce input parameters is Number", async function () {
      let inputPT04 = castevote();
      let result = governanceValidator.castvote(inputPT04);
      expect(result).to.equal(true);
    });
    it("-should be true when address input parameters is in regex pattern", async function () {
      let inputPT05 = castevote();
      let result = governanceValidator.castvote(inputPT05);
      expect(result).to.equal(true);
    });
    it("-should be true when choiceId input parameters length is equal to 36", async function () {
      let inputNT06 = castevote();
      let result = governanceValidator.castvote(inputNT06);
      expect(result).to.equal(true);
    });
    it("-should be true when ptoposalId input parameters length is equal to 36", async function () {
      let inputNT07 = castevote();
      let result = governanceValidator.castvote(inputNT07);
      expect(result).to.equal(true);
    });
  });

});

/*GetAddressNonce validation */
// describe("GetAddressNonce validation (GET) input validation", function() {
//   let GetAddressNonce = function() {
//     return {
//       ethereumAddress:'0x880aBa1911749C24189Dc72B238B20E9AD8E36E3',
//     };
//   };
//   /* negative test case */
//   describe("Negative test cases", function() {

//     it("-should be false when unknown input parameters are supplied", async function() {
//       let inputNT01 = GetAddressNonce();
//       inputNT01['unkown'] = 'unkown'
//       let result = governanceValidator.GetAddressNonce(inputNT01);
//       expect(result).to.equal(false);
//     });
//     it("-should be false when ethereumAddress input parameters is not string", async function() {
//       let inputNT02 = GetAddressNonce();
//       inputNT02['ethereumAddress'] = 12334
//       let result = governanceValidator.GetAddressNonce(inputNT02);
//       expect(result).to.equal(false);
//     });
//     it("-should be false when ethereumAddress input parameters is not in regex pattern", async function() {
//       let inputNT04 = GetAddressNonce();
//       inputNT04["ethereumAddress"] = "123456789";
//       let result = governanceValidator.GetAddressNonce(inputNT04);
//       expect(result).to.equal(false);
//     });

//   });

//     /* positive test case */
//     describe("-should be true when unknown input parameters are Not supplied", function() {
//       it("-should be true when input is valid", async function() {
//         let inputPT01 = GetAddressNonce();
//         let result = governanceValidator.GetAddressNonce(inputPT01);
//         expect(result).to.equal(true);
//       });
//       it("-should be true when ethereumAddress input parameters is string", async function() {
//         let inputPT02 = GetAddressNonce();
//         let result = governanceValidator.GetAddressNonce(inputPT02);
//         expect(result).to.equal(true);
//       });
//       it("-should be true when ethereumAddress input parameters is not in regex pattern", async function() {
//         let inputNT04 = GetAddressNonce();
//         let result = governanceValidator.GetAddressNonce(inputNT04);
//         expect(result).to.equal(true);
//       });
//     })
// });