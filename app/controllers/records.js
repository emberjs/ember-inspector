var RecordsController = Ember.ArrayController.extend({
  init: function() {
    this._super();
    this.set('filters', []);
    this.set('filterValues', {});
  },

  columns: Ember.computed.alias('modelType.columns'),

  filters: [],

  filterValues: {},

  search: '',

  modelChanged: function() {
    this.set('search', '');
  }.observes('model'),

  recordToString: function(record) {
    var search = Ember.get(record, 'searchIndex').join(' ');
    return search.toLowerCase();
  },

  filtered: function() {
    var self = this, search = this.get('search');
    return this.get('model').filter(function(item) {
      var filters = self.get('filterValues');
      for(var key in filters) {
        if (!filters[key] && Ember.get(item, 'filterValues.' + key)) {
          return false;
        }
      }
      if (!Ember.isEmpty(search)) {
        var searchString = self.recordToString(item);
        return !!searchString.toLowerCase().match(new RegExp('.*' + search + '.*'));
      }
      return true;
    });
  }.property('search', 'model.@each.columnValues', 'model.@each.filterValues', 'filterValues')

});

export default RecordsController;
