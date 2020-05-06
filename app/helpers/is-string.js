import { helper } from '@ember/component/helper';

export function isString([str]) {
  return typeof str === 'string';
}

export default helper(isString);
