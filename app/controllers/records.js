import Ember from "ember";
import escapeRegExp from "ember-inspector/utils/escape-reg-exp";
const { Controller, computed } = Ember;
const { none, alias } = computed;

export default Controller.extend({
  needs: ['application'],

  queryParams: ['filterValue', 'search'],

  columns: alias('modelType.columns'),

  search: '',
  filters: function() { return []; }.property(),
  filterValue: null,

  noFilterValue: none('filterValue'),

  actions: {
    setFilter: function(val) {
      val = val || null;
      this.set('filterValue', val);
    }
  },

  modelChanged: function() {
    this.set('search', '');
  }.observes('model'),

  recordToString: function(record) {
    let search = '';
    let searchKeywords = Ember.get(record, 'searchKeywords');
    if (searchKeywords) {
      search = Ember.get(record, 'searchKeywords').join(' ');
    }
    return search.toLowerCase();
  },

  filtered: function() {
    let search = this.get('search'), filter = this.get('filterValue');
    return this.get('model').filter(item => {
      // check filters
      if (filter && !Ember.get(item, 'filterValues.' + filter)) {
        return false;
      }

      // check search
      if (!Ember.isEmpty(search)) {
        let searchString = this.recordToString(item);
        return !!searchString.match(new RegExp('.*' + escapeRegExp(search.toLowerCase()) + '.*'));
      }
      return true;
    });
  }.property('search', 'model.@each.columnValues', 'model.@each.filterValues', 'filterValue')
});
