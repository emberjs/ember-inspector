import Ember from "ember";
import escapeRegExp from "ember-inspector/utils/escape-reg-exp";
const { Controller, computed, observer, inject: { controller } } = Ember;
const { none, readOnly } = computed;
const get = Ember.get;

export default Controller.extend({
  application: controller(),

  queryParams: ['filterValue', 'search'],

  columns: readOnly('modelType.columns'),

  search: '',

  filters: computed(() => []),

  filterValue: null,

  noFilterValue: none('filterValue'),

  actions: {
    setFilter(val) {
      val = val || null;
      this.set('filterValue', val);
    }
  },

  modelChanged: observer('model', function() {
    this.set('search', '');
  }),

  recordToString(record) {
    let search = '';
    let searchKeywords = get(record, 'searchKeywords');
    if (searchKeywords) {
      search = get(record, 'searchKeywords').join(' ');
    }
    return search.toLowerCase();
  },

  filtered: computed('search', 'model.@each.columnValues', 'model.@each.filterValues', 'filterValue', function() {
    let search = this.get('search');
    let filter = this.get('filterValue');
    return this.get('model').filter(item => {
      // check filters
      if (filter && !get(item, `filterValues.${filter}`)) {
        return false;
      }

      // check search
      if (!Ember.isEmpty(search)) {
        let searchString = this.recordToString(item);
        return !!searchString.match(new RegExp(`.*${escapeRegExp(search.toLowerCase())}.*`));
      }
      return true;
    });
  })
});
