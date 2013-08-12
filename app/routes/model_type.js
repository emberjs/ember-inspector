var ModelTypeRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    this._super(controller, model);
    this.controllerFor('model_types').set('selected', model);
  },

  deactivate: function() {
    this.controllerFor('model_types').set('selected', null);
  }
});

export default ModelTypeRoute;
