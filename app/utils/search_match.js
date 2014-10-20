import escapeRegExp from "utils/escape_reg_exp";
var isEmpty = Ember.isEmpty;

export default function(text, searchQuery) {
  if (isEmpty(searchQuery)) {
    return true;
  }
  var regExp = new RegExp(escapeRegExp(searchQuery.toLowerCase()));
  return !!text.toLowerCase().match(regExp);
};
