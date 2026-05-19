import { isEmpty } from '@ember/utils';

export default function (text) {
  if (isEmpty(text)) {
    return false;
  }
  return !!text.match(/(_loading$)|(\.loading$)|(_error$)|(\.error$)/);
}
