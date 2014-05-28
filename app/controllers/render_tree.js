import escapeRegExp from "utils/escape_reg_exp";
import debounceComputed from "computed/debounce";
var get = Ember.get;
var isEmpty = Ember.isEmpty;
var and = Ember.computed.and;
var equal = Ember.computed.equal;
var filter = Ember.computed.filter;

export default Ember.ArrayController.extend({
  needs: ['application'],

  initialEmpty: false,
  modelEmpty: equal('model.length', 0),
  showEmpty: and('initialEmpty', 'modelEmpty'),

  // bound to the input field, updates the `search` property
  // 300ms after changing
  searchField: debounceComputed('search', 300, function() {
    this.notifyPropertyChange('model');
  }),

  // model filtered based on this value
  search: '',

  escapedSearch: function() {
    return escapeRegExp(this.get('search').toLowerCase());
  }.property('search'),

  arrangedContent: filter('model', function(item) {
    var search = this.get('escapedSearch');
    if (isEmpty(search)) {
      return true;
    }
    var regExp = new RegExp(search);
    return !!recursiveMatch(item, regExp);
  })
});

function recursiveMatch(item, regExp) {
  var children, child;
  var name = get(item, 'name');
  if (name.toLowerCase().match(regExp)) {
    return true;
  }
  children = get(item, 'children');
  for (var i = 0; i < children.length; i++) {
    child = children[i];
    if (recursiveMatch(child, regExp)) {
      return true;
    }
  }
  return false;
}
