var Route = Ember.Route;
var Promise = Ember.RSVP.Promise;

export default Route.extend({
  model: function() {
    var port = this.get('port');
    return new Promise(function(resolve) {
      port.one('container:types', function(message) {
        resolve(message.types);
      });
      port.send('container:getTypes');
    });
  },
  actions: {
    reload: function() {
      this.refresh();
    }
  }
});
