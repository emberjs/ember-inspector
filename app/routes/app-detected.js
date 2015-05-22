import Ember from 'ember';
const { Route, RSVP: { Promise } } = Ember;

export default Route.extend({
  model: function() {
    let port = this.get('port');
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
    this.get('port').one('general:reset', this, this.reset);
  },

  reset: function() {
    this.container.lookup('application:main').reset();
  },

  deactivate: function() {
    this.get('port').off('general:applicationBooted');
    this.get('port').off('general:reset', this, this.reset);
  }
});
