var RecordController = Ember.ObjectController.extend({

  modelTypeColumns: Ember.computed.alias('target.target.columns'),

  colorMap: {
    red: '#ff2717',
    blue: '#174fff'
  },

  // TODO: Color record based on `color` property.
  style: function() {
    if (!Ember.isEmpty(this.get('color'))) {
      var color = this.colorMap[this.get('color')];
      if (color) {
        return 'color:' + color + ';';
      }
    }
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
