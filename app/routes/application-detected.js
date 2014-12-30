import Ember from 'ember';
var Route = Ember.Route;
var Promise = Ember.RSVP.Promise;

export default Route.extend({
  model: function() {
   var port = this.get('port');
    return new Promise(function(resolve) {
      port.on('general:applicationBooted', this, function(message) {
        if (message.booted) {
          port.off('general:applicationBooted');
          resolve();
        }
      });
      port.send('general:applicationBooted');
    }.bind(this));
  },

  setupController: function() {
    this.controllerFor('application').set('emberApplication', true);
  }
});
