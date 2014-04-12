var Promise = Ember.RSVP.Promise;

export default Ember.Route.extend({
  model: function() {
    var route = this, port = this.get('port');
    return new Promise(function(resolve) {
      port.one('render:profilesAdded', function(message) {
        resolve(message.profiles);
      });
      port.send('render:watchProfiles');
    });
  },

  setupController: function(controller) {
    this._super.apply(this, arguments);
    var port = this.get('port');
    port.on('render:profilesUpdated', this, this.profilesUpdated);
    port.on('render:profilesAdded', this, this.profilesAdded);
  },

  deactivate: function() {
    var port = this.get('port');
    port.off('render:profilesUpdated', this, this.profilesUpdated);
    port.off('render:profilesAdded', this, this.profilesAdded);
    port.send('render:releaseProfiles');
  },

  profilesUpdated: function(message) {
    this.set('controller.model', message.profiles);
  },

  profilesAdded: function(message) {
    var model = this.get('controller.model');
    var profiles = message.profiles;

    model.pushObjects(profiles);
  },

  actions: {
    clearProfiles: function() {
      this.get('port').send('render:clear');
    }
  }

});
