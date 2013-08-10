var RecordController = Ember.ObjectController.extend({

  modelTypeColumns: Ember.computed.alias('target.target.columns'),

  // TODO: Color record based on `color` property.
  style: function() {
    return '';
  }.property('color'),

  columns: function() {
    var self = this;
    return this.get('modelTypeColumns').map(function(col) {
      return { name: col.name, value: self.get('columnValues.' + col.name) };
    });
  }.property('modelTypeColumns.@each', 'model.columnValues')
});

export default RecordController;
