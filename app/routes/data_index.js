var DataIndexRoute = Ember.Route.extend({
  beforeModel: function() {
    this.transitionTo('model_types');
  }
});

export default DataIndexRoute;
