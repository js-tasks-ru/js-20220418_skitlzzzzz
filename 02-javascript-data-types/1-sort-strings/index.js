/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let sortMas = Array.from(arr);
  sortMas = sortMas.sort(((a, b) => a.localeCompare(b,'ru',  {sensitivity: 'case', caseFirst: 'upper'})));
  if (param === 'desc') {
    sortMas.reverse();
  }
  return sortMasgit
}

