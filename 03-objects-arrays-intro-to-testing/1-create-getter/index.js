/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const errorMsg = 'Empty argument';

  if (path === '') {
    throw new Error(errorMsg + ' $path');
  }

  let pathList = path.split('.')

  return function findProperty(obj) {

    if (!obj) {
      throw new Error(errorMsg + ' $obj');
    }

    return pathList.reduce((object, path) => {
      if (object === undefined){
        return undefined;
      }
      return (object)[path];
    }, obj);

  };
}
