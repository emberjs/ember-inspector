var Promise = Ember.RSVP.Promise, set = Ember.set;

var RecordsRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    this._super(controller, model);

    var type = this.modelFor('model_type');

    controller.set('modelType', this.modelFor('model_type'));

    this.get('port').on('data:recordsAdded', this, this.addRecords);
    this.get('port').on('data:recordUpdated', this, this.updateRecord);
    this.get('port').on('data:recordsRemoved', this, this.removeRecords);
    this.get('port').one('data:filters', this, function(message) {
      this.set('controller.filters', message.filters);
    });
    this.get('port').send('data:getFilters');
    this.get('port').send('data:getRecords', { objectId: type.objectId });
  },

  model: function() {
    return [];
  },

  deactivate: function() {
    this.get('port').off('data:recordsAdded', this, this.addRecords);
    this.get('port').off('data:recordUpdated', this, this.updateRecord);
    this.get('port').off('data:recordsRemoved', this, this.removeRecords);
    this.get('port').send('data:releaseRecords');
  },

  updateRecord: function(message) {
    var currentRecord = this.get('currentModel').findProperty('objectId', message.record.objectId);
    set(currentRecord, 'columnValues', message.record.columnValues);
    set(currentRecord, 'filterValues', message.record.filterValues);
    set(currentRecord, 'searchIndex', message.record.searchIndex);
  },

  addRecords: function(message) {
    this.get('currentModel').pushObjects(message.records);
  },

  removeRecords: function(message) {
    this.get('currentModel').removeAt(message.index, message.count);
  },

  events: {
    inspectModel: function(model) {
      this.get('port').send('data:inspectModel', { objectId: Ember.get(model, 'objectId') });
    }
  }
});

export default RecordsRoute;
