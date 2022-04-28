/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (string === '') {
    return string;
  }

  if (size === undefined) {
    return string;
  }

  let masString = [...string];
  let repeatString = [];
  let stringNew = '';

  if (size === 0) {
    return stringNew;
  }

  masString.forEach(function (item, index, object) {
    if(object[index] === object[index + 1]  || object[index + 1] === undefined) {
      repeatString[item] = (repeatString[item] || 0) + 1;
      if (repeatString[item] <= size) {
        stringNew += item;
      } else if(object[index] !== object[index - 1] && repeatString[item]>size){
        repeatString[item] = 1;
        stringNew += item;
      }

    } else {
      if(object[index] !== object[index - 1] || (object[index] === object[index - 1] && repeatString[item] < size)){
        repeatString[item] = 1;
        stringNew += item;
      }
    }
  }, masString);

  return stringNew;
}
