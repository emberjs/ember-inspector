var Promise = Ember.RSVP.Promise;

export default Ember.Route.extend({
  beforeModel: function() {
    var route = this;
    return new Promise(function(resolve) {
      route.get('port').one('promise:supported', this, function(message) {
        if (message.supported) {
          route.transitionTo('promise-tree');
        } else {
          resolve();
        }
      });
      route.get('port').send('promise:supported');
    });
  },

  renderTemplate: function() {
    this.render('promises.error');
  }
});
