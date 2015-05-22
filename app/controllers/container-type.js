import Ember from "ember";
import debounceComputed from "ember-inspector/computed/debounce";
import searchMatch from "ember-inspector/utils/search-match";
const { ArrayController, computed, get } = Ember;
const { filter } = computed;

export default ArrayController.extend({
  needs: ['application'],
  sortProperties: ['name'],

  searchVal: debounceComputed('search', 300),

  search: null,

  arrangedContent: filter('model', function(item) {
    return searchMatch(get(item, 'name'), this.get('search'));
  }).property('model.@each.name', 'search')
});
