var Promise = Ember.RSVP.Promise;
var DataIndexRoute = Ember.Route.extend({
  model: function() {
    var self = this;
    return new Promise(function(resolve) {
      self.get('port').one('data:hasAdapter', function(message) {
        resolve(message.hasAdapter);
      });
      self.get('port').send('data:checkAdapter');
    });
  },
  afterModel: function(model) {
    if (model) {
      this.transitionTo('model_types');
    }
  }
});

export default DataIndexRoute;
