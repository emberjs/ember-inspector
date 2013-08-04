var RecordController = Ember.ObjectController.extend({

  modelTypeColumns: Ember.computed.alias('target.target.columns'),

  columns: function() {
    var self = this;
    return this.get('modelTypeColumns').map(function(col) {
      return { name: col.name, value: self.get('columnValues.' + col.name) };
    });
  }.property('modelTypeColumns.@each', 'model.columnValues')
});

export default RecordController;
