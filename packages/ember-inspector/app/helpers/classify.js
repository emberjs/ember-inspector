import { classify } from '@ember/string';
import { helper } from '@ember/component/helper';

export function classifyString([str]) {
  return classify(str).replace(/\//g, '::');
}

export default helper(classifyString);
