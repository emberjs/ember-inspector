import Ember from "ember";
import debounceComputed from "ember-inspector/computed/debounce";
import searchMatch from "ember-inspector/utils/search-match";
const { Controller, computed, get, inject } = Ember;
const { filter } = computed;

export default Controller.extend({
  application: inject.controller(),
  sortProperties: ['name'],

  searchVal: debounceComputed('search', 300),

  search: null,

  filtered: filter('model', function(item) {
    return searchMatch(get(item, 'name'), this.get('search'));
  }).property('model.@each.name', 'search')
});
