import Ember from "ember";
import escapeRegExp from "ember-inspector/utils/escape-reg-exp";
var isEmpty = Ember.isEmpty;

export default function(text, searchQuery) {
  if (isEmpty(searchQuery)) {
    return true;
  }
  var regExp = new RegExp(escapeRegExp(searchQuery.toLowerCase()));
  return !!text.toLowerCase().match(regExp);
}
