import { helper } from '@ember/component/helper';

/**
 * Determine the type of the component argument for display
 *
 * @method componentArgumentDisplay
 * @param {*} argument
 * @return {*} The argument with the correct type for display
 */
export function componentArgumentDisplay([argument]) {
  if (typeof argument === 'string') {
    // Escape any interior quotes – we will add the surrounding quotes in the template
    return argument.replace(/"/g, '\\"');
  } else if (typeof argument === 'object' && argument !== null) {
    return '...';
  }

  return String(argument);
}

export default helper(componentArgumentDisplay);
