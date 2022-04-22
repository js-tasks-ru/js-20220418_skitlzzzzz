/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  let mas = {};

  if (fields === []) {
    return mas;
  }

  let exclude = fields;
  mas = Object.fromEntries(Object.entries(obj).filter(e => !exclude.includes(e[0])));

  return mas;
};
