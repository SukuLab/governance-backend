import { isString, isNumber, isArray, isObject } from "util";
let genericValidator = new Object();

genericValidator.checkIsSet = input => input ? true : false;
genericValidator.checkIsObject = input => isObject(input) ? true : false;
genericValidator.checkIsArray = input => isArray(input) ? true : false;
genericValidator.checkIsString = input => isString(input) ? true : false;
genericValidator.checkIsNumber = input => isNumber(input) ? true : false;

genericValidator.checkIsStringAndNotEmpty = input => (isString(input) && input.length > 0) ? true : false;
genericValidator.checkIsArrayAndNotEmpty = input => (isArray(input) && input.length > 0) ? true : false;
genericValidator.checkIsObjectAndNotEmpty = input => (isObject(input) && Object.keys(input).length > 0) ? true : false;
genericValidator.checkIsNumberAboveZero = input => (isNumber(input) && input > 0) ? true : false;
genericValidator.checkIsNumberAboveOrEqualZero = input => (isNumber(input) && input >= 0) ? true : false;

genericValidator.checkIsInputObjectContainsUnknownKeys = (arr1, arr2) => {
  let difference = arr1
    .filter(x => !arr2.includes(x))
    .concat(arr2.filter(x => !arr1.includes(x)));
  return (isArray(difference) && difference.length > 0) ? true : false;
}

genericValidator.includesIn = (value, arr) => {
  if (arr.includes(value)) {
    return true;
  }
  return false;
}

genericValidator.checkUndefinedNullEmpty = (data) => {
  if(data === undefined || data === null || data === '') {
    return true;
  }
  return false;
}

export default genericValidator;