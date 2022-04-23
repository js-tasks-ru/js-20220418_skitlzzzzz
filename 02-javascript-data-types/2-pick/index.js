/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  let mas = {};

  if (fields === []) {
    return mas;
  }

  let include = fields;
  mas = Object.fromEntries(Object.entries(obj).filter(e => include.includes(e[0])));

  return mas;

  //это старое решение, которое тоже правильно решает
  // mas =  Object.entries(obj).map(([key, value]) => [key, value]);
  //
  // fields.forEach( function(item) {
  //   for(let i = 0; i < mas.length; i++) {
  //     for (let j = 0; j < mas[i].length; j++) {
  //       if (item === mas[i][j]) {
  //         masWithFields.push(mas[i]);
  //       }
  //     }
  //
  //   }
  // });
  //
  // mas = Object.fromEntries(masWithFields);
};
