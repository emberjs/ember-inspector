import { helper } from '@ember/component/helper';
import { isArray } from '@ember/array';

/**
 * Determine the type of the component argument for display
 *
 * @method componentArgumentDisplay
 * @param {*} argument
 * @return {*} The argument with the correct type for display
 */
export function componentArgumentDisplay([argument]) {
  if (typeof argument === 'string') {
    return `"${argument}"`;
  } else if (argument === null) {
    return 'null';
  } else if (argument === undefined) {
    return 'undefined';
  } else if(isArray(argument) || typeof argument === 'object'){
    return '...';
  }

  return argument;
}

export default helper(componentArgumentDisplay);