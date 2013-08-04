var Promise = Ember.RSVP.Promise;

var ModelTypesRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    this._super(controller, model);
    this.get('port').on('data:modelTypesAdded', this, this.addModelTypes);
    this.get('port').on('data:modelTypesUpdated', this, this.updateModelTypes);
    this.get('port').send('data:getModelTypes');
  },

  model: function() {
    return [];
  },

  deactivate: function() {
    this.get('port').off('data:modelTypesUpdated', this, this.updateModelType);
    this.get('port').off('data:modelTypesAdded', this, this.updateModelType);
    this.get('port').send('data:releaseModelTypes');
  },

  addModelTypes: function(message) {
    this.get('currentModel').pushObjects(message.modelTypes);
  },

  updateModelTypes: function(message) {
    var self = this;
    message.modelTypes.forEach(function(modelType) {
      var currentType = self.get('currentModel').findProperty('objectId', modelType.objectId);
      Ember.set(currentType, 'count', modelType.count);
    });
  },

  events: {
    viewRecords: function(type) {
      this.transitionTo('records', type);
    }
  }
});

export default ModelTypesRoute;
