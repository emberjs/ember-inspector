var RecordFilterController = Ember.ObjectController.extend({
  init: function() {
    this._super();
    this.valueChanged();
  },

  needs: ['records'],

  checked: true,

  labelStyle: function() {
    if (!this.get('checked')) { return 'text-decoration: line-through;'; }
    return '';
  }.property('checked'),

  toggleCheck: function() {
    this.toggleProperty('checked');
  },

  valueChanged: function() {
    if (!this.get('name')) { return; }
    this.set('controllers.records.filterValues.' + this.get('name'), this.get('checked'));
    this.get('controllers.records').notifyPropertyChange('filterValues');
  }.observes('checked', 'name')
});

export default RecordFilterController;
