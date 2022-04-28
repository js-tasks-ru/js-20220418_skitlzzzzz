/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (!obj) {
    return obj;
  }

  let entries = Object.entries(obj);
  const inverted = entries.map(([key, value]) => [value, key]);

  return Object.fromEntries(inverted);
}
