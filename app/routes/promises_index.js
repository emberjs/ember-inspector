var Promise = Ember.RSVP.Promise;
var PromisesIndex = Ember.Route.extend({
  beforeModel: function() {
    var self = this;
    return new Promise(function(resolve) {
      self.get('port').one('general:promiseSupported', this, function(message) {
        if (message.supported) {
          self.transitionTo('promise_tree');
        } else {
          resolve();
        }
      });
      self.get('port').send('general:promiseSupported');
    });
  },

  renderTemplate: function() {
    this.render('promises.error');
  }
});

export default PromisesIndex;
