var Promise = Ember.RSVP.Promise;
var PromisesIndex = Ember.Route.extend({
  beforeModel: function() {
    var self = this;
    return new Promise(function(resolve) {
      self.get('port').one('promise:supported', this, function(message) {
        if (message.supported) {
          self.transitionTo('promise_tree');
        } else {
          resolve();
        }
      });
      self.get('port').send('promise:supported');
    });
  },

  renderTemplate: function() {
    this.render('promises.error');
  }
});

export default PromisesIndex;
