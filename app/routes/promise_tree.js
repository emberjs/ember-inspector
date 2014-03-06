var Promise = Ember.RSVP.Promise;

export default Ember.Route.extend({
  model: function() {
    // block rendering until first batch arrives
    // Helps prevent flashing of "please refresh the page"
    var route = this;
    return new Promise(function(resolve) {
      route.get('assembler').one('firstMessageReceived', function() {
        resolve(route.get('assembler.topSort'));
      });
      route.get('assembler').start();
    });

  },

  deactivate: function() {
    this.get('assembler').stop();
  },

  actions: {
    sendValueToConsole: function(promise) {
      this.get('port').send('promise:sendValueToConsole', { promiseId: promise.get('guid') });
    }
  }
});
