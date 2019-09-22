import { isEmpty } from '@ember/utils';
import { helper } from '@ember/component/helper';

export function isEmptyHelper([item]) {
  return isEmpty(item);
}

export default helper(isEmptyHelper);
