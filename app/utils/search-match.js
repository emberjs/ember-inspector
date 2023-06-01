import { isEmpty } from '@ember/utils';
import escapeRegExp from 'ember-inspector/utils/escape-reg-exp';

const sanitize = function (str) {
  return str.toLowerCase().replace(/-/g, '');
};

export default function (text, searchQuery) {
  if (isEmpty(searchQuery)) {
    return true;
  }
  let regExp = new RegExp(escapeRegExp(sanitize(searchQuery)));
  return sanitize(text).match(regExp);
}
