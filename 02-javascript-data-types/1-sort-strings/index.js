/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let sortMas = Array.from(arr);
  let collator = new Intl.Collator('ru-en', {sensitivity: 'case', caseFirst: 'upper'});
  const error = 'Parameter should be desc or asc';

  if (param !== 'asc' && param !== 'desc'){
    return error;
  }
  if (param === 'desc') {
    sortMas.sort(function(b, a) {
      return collator.compare(a, b);
    });
  } else {
    sortMas.sort(function(a, b) {
      return collator.compare(a, b);
    });
  }

  return sortMas;
}
