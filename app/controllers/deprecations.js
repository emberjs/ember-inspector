import Ember from "ember";
import debounceComputed from "ember-inspector/computed/debounce";
import searchMatch from "ember-inspector/utils/search-match";
var Controller = Ember.Controller;
var computed = Ember.computed;
var filter = computed.filter;
var get = Ember.get;

export default Controller.extend({
  needs: ['application'],
  search: null,
  searchVal: debounceComputed('search', 300),
  filtered: filter('model', function(item) {
    return searchMatch(get(item, 'message'), this.get('search'));
  }).property('model.@each.message', 'search')
});

