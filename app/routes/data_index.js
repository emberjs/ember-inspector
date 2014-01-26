var Promise = Ember.RSVP.Promise;

export default Ember.Route.extend({
  model: function() {
    var route = this;
    return new Promise(function(resolve) {
      route.get('port').one('data:hasAdapter', function(message) {
        resolve(message.hasAdapter);
      });
      route.get('port').send('data:checkAdapter');
    });
  },
  afterModel: function(model) {
    if (model) {
      this.transitionTo('model_types');
    }
  }
});
