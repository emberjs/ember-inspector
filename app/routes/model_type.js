export default Ember.Route.extend({
  setupController: function(controller, model) {
    this._super(controller, model);
    this.controllerFor('model-types').set('selected', model);
  },

  deactivate: function() {
    this.controllerFor('model-types').set('selected', null);
  }
});
