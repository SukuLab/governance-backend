*** Settings ***
Library  String
Library  Process
Library  OperatingSystem
Library  Collections
Library  RequestsLibrary
Library  MockServerLibrary
Suite Setup  Create Sessions

*** Variables ***
${url}   http://sukugovernance:3000
${MOCK_URL}   http://mockserver:1080/

*** Keywords ***
Create Sessions
    Create Mock Session   ${MOCK_URL}
    #wait-for  
    Sleep  20s

Session Creation
    &{headers}=  Create Dictionary  Content-Type=application/json  token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOm51bGwsInR5cGUiOiJqd3QyIiwiaWF0IjoxNTU0NDc4MTIzLCJleHAiOjE1NTcwNzAxMjN9.gQj85QIl3GxPlYJ2FXngFJikiF4Zru8NrLrKKWV07R37blWRR_wM7otpYelu3MYAcirL62xqbfPBonMOQi5qB4dk7ZOw0ElDaw0DQJG09drPZG1PlocpLZbUxW_dI-OUnbDOUkLgKkFRk-6fYGoZ0pxAMjBMEOejJt1o5RDLHkCSHZrkTMS9H3O8SNrxdBALR6_bFV25gKudv3gZ8rc2WKFE3ZxvfR7rWYCi0XPlM49dhUvIcG5acTyJEcVhFk0wh6mgzNiCYBN9AY7kfGDegEjGp95eOYRPk33MfVxwb8Wry5pgjOXaIbsBVT0ea5hoxyFY9GZQfgU73CDbg6aZJg
    Create Session   governance   ${url}    headers=${headers}

Get Input Data
    [Arguments]  ${file}
    ${object}=  Evaluate  json.load(open("${file}", "r"))   json
    [return]  ${object}

Api call for creating proposal
    [Arguments]  ${object}
    ${result}=  Post Request  governance   /proposals/   data=${object}
    [return]  ${result}

Checking response for Create proposal  
    [Arguments]  ${object}  ${result}
    Run Keyword If  ${result.json()["status"]["error"]} == ${false}  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  ${result.json()["status"]["code"]} == ${200}  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["type"]}" == "OK"  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["message"]}" == "Success"  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["keyword"]}" == "proposal-submit-success"  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["data"]["proposalId"]}" == "${object["proposalName"]}"  Should Be Equal  ${result.status_code}  ${200}

Checking response for Create proposal for invalid data  
    [Arguments]  ${result}
    Run Keyword If  ${result.json()["status"]["error"]} == ${true}  Should Be Equal  ${result.status_code}  ${400}
    Run Keyword If  ${result.json()["status"]["code"]} == ${400}  Should Be Equal  ${result.status_code}  ${400}
    Run Keyword If  "${result.json()["status"]["type"]}" == "Bad Request"  Should Be Equal  ${result.status_code}  ${400}
    Run Keyword If  "${result.json()["status"]["message"]}" == "Provided request input is not valid"  Should Be Equal  ${result.status_code}  ${400}
    Run Keyword If  "${result.json()["status"]["keyword"]}" == "invalid-request"  Should Be Equal  ${result.status_code}  ${400}

Api call for getting proposals
    ${result}=  Get Request  governance   /proposals?status=unexpired&limit=2 
    [return]  ${result}

Checking response for getting proposals
    [Arguments]  ${result}
    Run Keyword If  ${result.json()["status"]["error"]} == ${false}  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  ${result.json()["status"]["code"]} == ${200}  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["type"]}" == "OK"  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["message"]}" == "Success"  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["keyword"]}" == "proposals-fetch-success"  Should Be Equal  ${result.status_code}  ${200}

Get proposal id
    Session Creation
    ${object}=  Get Input Data  proposal.json
    ${result}=  Api call for creating proposal  ${object}
    Log   ${result.json()}
    [return]  ${result}

Api call for retriving individual proposal  
    [Arguments]  ${proid}
    Log   ${proid.json()}
    ${result}=  Get Request  governance   /proposals/${proid.json()["data"]["proposalId"]}
    [return]  ${result}

Api call for retriving individual proposal with wrong data
    ${result}=  Get Request  governance   /proposals/12367-046384
    [return]  ${result}

Checking response for retriving proposals  
    [Arguments]  ${result}
    Log   ${result.json()}
    Run Keyword If  ${result.json()["status"]["error"]} == ${false}  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  ${result.json()["status"]["code"]} == ${200}  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["type"]}" == "OK"  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["message"]}" == "Success"  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["keyword"]}" == "proposals-fetch-success"  Should Be Equal  ${result.status_code}  ${200}
   
Checking response for retriving individual proposal with wrong data  
   [Arguments]  ${result}
    Run Keyword If  ${result.json()["status"]["error"]} == ${true}  Should Be Equal  ${result.status_code}  ${404}
    Run Keyword If  ${result.json()["status"]["code"]} == ${404}  Should Be Equal  ${result.status_code}  ${404}
    Run Keyword If  "${result.json()["status"]["type"]}" == "Not Found"  Should Be Equal  ${result.status_code}  ${404}
    Run Keyword If  "${result.json()["status"]["message"]}" == "Resource not found"  Should Be Equal  ${result.status_code}  ${404}
    Run Keyword If  "${result.json()["status"]["keyword"]}" == "proposal-not-found"  Should Be Equal  ${result.status_code}  ${404}

Api call to obtain address nonce
    [Arguments]  ${address}
    ${result}=  Get Request  governance   /nonce/${address["address"]}
    [return]  ${result}

Get Address
    Session Creation
    ${address}=  Get Input Data  vote.json
    [return]  ${address}

Checking response for api call to obtain address nonce  
    [Arguments]  ${result}
    Run Keyword If  ${result.json()["status"]["error"]} == ${false}  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  ${result.json()["status"]["code"]} == ${200}  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["type"]}" == "OK"  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["message"]}" == "Success"  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["keyword"]}" == "nonce-fetch-success"  Should Be Equal  ${result.status_code}  ${200}
    
Api call to retrive governance address
    ${result}=  Get Request  governance   /version
    [return]  ${result}

Checking response to retrive governance version  
    [Arguments]  ${result}
    Run Keyword If  ${result.json()["status"]["error"]} == ${false}  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  ${result.json()["status"]["code"]} == ${200}  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["type"]}" == "OK"  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["message"]}" == "successfully retrived current version"  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["keyword"]}" == "version-fetch-success"  Should Be Equal  ${result.status_code}  ${200}

Api call to fetch default version
    ${result}=  Get Request  governance   /
    [return]  ${result}

Checking response to fetch default version
    [Arguments]  ${result}
    Run Keyword If  ${result.json()["status"]["error"]} == ${false}  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  ${result.json()["status"]["code"]} == ${200}  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["type"]}" == "OK"  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["message"]}" == "This is the default route."  Should Be Equal  ${result.status_code}  ${200}
    Run Keyword If  "${result.json()["status"]["keyword"]}" == "version-fetch-success"  Should Be Equal  ${result.status_code}  ${200}

Api call to caste a vote
    [Arguments]  ${object}  ${proid}
    ${result}=  Get Request  governance  /proposals/${proid.json()["data"]["proposalId"]}/votes  data=${object}
    [return]  ${result}
    
Checking response for casting vote  ${result}
    [Arguments]  ${result}
    Run Keyword If  ${result.json()["status"]["error"]} == ${true}  Should Be Equal  ${result.status_code}  ${403}
    Run Keyword If  ${result.json()["status"]["code"]} == ${403}  Should Be Equal  ${result.status_code}  ${403}
    Run Keyword If  "${result.json()["status"]["type"]}" == "Forbidden"  Should Be Equal  ${result.status_code}  ${403}
    Run Keyword If  "${result.json()["status"]["keyword"]}" == "invalid-signature"  Should Be Equal  ${result.status_code}  ${403}

Verify Token GET With Body
    [Arguments]  ${ENDPOINT}  ${HEADERS}  ${resbody}
    &{req}=  Create Mock Request Matcher  GET  ${ENDPOINT}
    &{rsp}=  Create Mock Response  status_code=200  headers=${HEADERS}  body=${resbody}
    Create Mock Expectation  ${req}  ${rsp}

***Test Cases***
Get Response from onboardingauth for token verification
    ${ENDPOINT}  Set Variable  /node/jwt/verify
    ${HEADERS}  Create Dictionary  Content-type=application/json
    ${resbody}  Evaluate  json.load(open("verifyJWTTOKEN.json", "r"))  json
    Verify Token GET With Body  ${ENDPOINT}  ${HEADERS}  ${resbody}

Create proposal
    [Tags]  Positive
    Session Creation
    ${object}=  Get Input Data  proposal.json
    ${result}=  Api call for creating proposal  ${object}
    Checking response for Create proposal  ${object}  ${result}

Create proposal with invalid data
    [Tags]  Negetive
    Session Creation
    ${object}=  Get Input Data  invalidproposal.json
    ${result}=  Api call for creating proposal  ${object} 
    Checking response for Create proposal for invalid data  ${result}  

To get all proposals
    [Tags]  Positive
    Session Creation
    ${result}=  Api call for getting proposals 
    Checking response for getting proposals  ${result}

To retrive a proposal 
    [Tags]  Positive
    Session Creation
    ${proid}=  Get proposal id
    ${result}=  Api call for retriving individual proposal  ${proid}
    Checking response for retriving proposals  ${result}

To retrive a proposal with wrong prod proposalid
    [Tags]  Negetive
    Session Creation
    ${result}=  Api call for retriving individual proposal with wrong data
    Checking response for retriving individual proposal with wrong data  ${result}

To obtain address nonce
    [Tags]  Positive
    Session Creation
    ${address}=  Get address
    ${result}=  Api call to obtain address nonce   ${address}
    Checking response for api call to obtain address nonce  ${result}

To retrive governance version
    [Tags]  Positive
    Session Creation
    ${result}=  Api call to retrive governance address 
    Checking response to retrive governance version  ${result}
    
To retrive governance default version
    [Tags]  Positive
    Session Creation
    ${result}=  Api call to fetch default version
    Checking response to fetch default version  ${result}
  
#To cast a vote
    #[Tags]  Positive
    #Session Creation
    #${proid}=  Get proposal id
    #${object}=  Get Input Data  vote.json
    #${result}=  Api call to caste a vote  ${object}  ${proid}
    #Checking response for casting vote  ${result}

 


   
