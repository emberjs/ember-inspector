import { helper } from '@ember/component/helper';

export function console(_) {
  return console.log(_);
}

export default helper(console);
