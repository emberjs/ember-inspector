import { isEmpty } from '@ember/utils';
import { helper } from '@ember/component/helper';

export function isEmptyHelper([str]) {
  return isEmpty(str);
}

export default helper(isEmptyHelper);
