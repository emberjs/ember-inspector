var RecordsController = Ember.ArrayController.extend({
  init: function() {
    this._super();
    this.set('filters', []);
    this.set('filterValues', {});
  },

  columns: Ember.computed.alias('modelType.columns'),

  filters: [],

  filterValue: null,

  noFilterValue: Ember.computed.none('filterValue'),

  search: '',

  actions: {
    setFilter: function(val) {
      val = val || null;
      this.set('filterValue', val);
    }
  },

  modelChanged: function() {
    this.setProperties({
      filterValue: null,
      search: ''
    });
  }.observes('model'),

  recordToString: function(record) {
    var search = '';
    var searchKeywords = Ember.get(record, 'searchKeywords');
    if (searchKeywords) {
      search = Ember.get(record, 'searchKeywords').join(' ');
    }
    return search.toLowerCase();
  },

  filtered: function() {
    var self = this, search = this.get('search'), filter = this.get('filterValue');
    return this.get('model').filter(function(item) {
      // check filters
      if (filter && !Ember.get(item, 'filterValues.' + filter)) {
        return false;
      }

      // check search
      if (!Ember.isEmpty(search)) {
        var searchString = self.recordToString(item);
        return !!searchString.match(new RegExp('.*' + escapeRegExp(search.toLowerCase()) + '.*'));
      }
      return true;
    });
  }.property('search', 'model.@each.columnValues', 'model.@each.filterValues', 'filterValue')

});

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export default RecordsController;
