# SUKU Governance Backend
This is an Express based NodeJS backend which provides a REST API for **proposals** to be submitted, and voted on, by members of the SUKU ecosystem. 

A **proposal** is not limited to one category, but may represent a plan of action to improve the ecosystem. 

Once a proposal is created, anyone may then cast a vote by signing it with a private key that holds SUKU tokens. Their vote is weighted proportionally to their holdings. The proposal will then expire at a specific Ethereum block where all votes will be tallied by summing the SUKU holdings at that exact block. This allows votes to be cast off-chain AND prevent double-voting. 

Please see [governance-ui](https://github.com/SukuLab/governance-ui) for a web3 enabled Angular UI that interfaces with this API.

## To Run
`npm run install`  
`npm run build`  
`npm run start`   
