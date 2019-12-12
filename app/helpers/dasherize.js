import { dasherize } from '@ember/string';
import { helper } from '@ember/component/helper';

export function dasherizeString([str]) {
  return dasherize(str).replace(/\//g, '::');
}

export default helper(dasherizeString);
