var RecordsController = Ember.ArrayController.extend({
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
    var self = this, search = this.get('search'), filtered;
    if (Ember.isEmpty(search)) {
      filtered = this.get('model');
    } else {
      filtered = this.get('model').filter(function(item) {
        var searchString = self.recordToString(item);
        return !!searchString.toLowerCase().match(new RegExp('.*' + search + '.*'));
      });
    }
    return filtered.filter(function(item) {
      var filters = self.get('filterValues');
      for(var key in filters) {
        if (!filters[key] && Ember.get(item, 'filterValues.' + key)) {
          return false;
        }
      }
      return true;
    });
  }.property('search', 'model.@each.columnValues', 'model.@each.filterValues', 'filterValues')

});

export default RecordsController;
