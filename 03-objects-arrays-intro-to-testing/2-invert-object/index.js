/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (!obj) {
    return obj;
  }

  let obj1 = {...obj};
  obj1 = Object.entries(obj1);

  obj1.forEach(function (item, index, object) {
    [object[index][0], object[index][1]] = [object[index][1], object[index][0]];
  });

  return Object.fromEntries(obj1);
}
