import { helper } from '@ember/component/helper';

export function match([str1, str2]) {
  return Boolean(str1.match(str2)) || Boolean(str2.match(str1));
}

export default helper(match);
