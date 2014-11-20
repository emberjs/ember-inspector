import Ember from "ember";
import debounceComputed from "ember-inspector/computed/debounce";
import searchMatch from "ember-inspector/utils/search-match";
var ArrayController = Ember.ArrayController;
var computed = Ember.computed;
var filter = computed.filter;
var get = Ember.get;

export default ArrayController.extend({
  needs: ['application'],
  sortProperties: ['name'],

  searchVal: debounceComputed('search', 300),

  search: null,

  arrangedContent: filter('model', function(item) {
    return searchMatch(get(item, 'name'), this.get('search'));
  }).property('model.@each.name', 'search')
});
