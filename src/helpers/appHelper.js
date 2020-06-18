import randommize from 'randomatic';
let appHelper = new Object();

appHelper.generateRandomNum = (length) => {
  return randommize('0', length);
}

/* Is an exceptional case here to disable the max-params rule (Later we can update it as a single object parameter to avoid this linting error)*/
// eslint-disable-next-line max-params
appHelper.apiResponse = (resStatusCode, resMessageKey, resData, resKeyword = "") => {
  return {
    responseStatusCode: resStatusCode,
    responseMessageKey: resMessageKey,
    responseData: resData,
    responseKeyword: resKeyword 
  };
}

appHelper.dalResponse = (status, data, extra) => {
  return {
    status: status,
    data: data,
    extra: extra
  }
}

appHelper.serviceResponse = (status, keyword, data) => {
  return {
    status: status,
    keyword: keyword,
    data: data
  }
}

appHelper.schemaLessModelParser = data => {
  let stringified = JSON.stringify(data);
  return JSON.parse(stringified);
};

export default appHelper;