var COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400'
};

var RecordItemController = Ember.ObjectController.extend({
  needs: ['records'],

  modelTypeColumns: Ember.computed.alias('controllers.records.columns'),

  // TODO: Color record based on `color` property.
  style: function() {
    if (!Ember.isEmpty(this.get('color'))) {
      var color = COLOR_MAP[this.get('color')];
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

export default RecordItemController;
