var Promise = Ember.RSVP.Promise;

export default Ember.Route.extend({
  model: function() {
    var route = this;
    return new Promise(function(resolve) {
      route.get('port').one('general:libraries', function(message) {
        resolve(message.libraries);
      });
      route.get('port').send('general:getLibraries');
    });
  }
});
