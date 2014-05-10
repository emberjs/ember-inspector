var Promise = Ember.RSVP.Promise;

export default Ember.Route.extend({
  setupController: function(controller) {
    var port = this.get('port');
    controller.set('model', []);
    port.on('render:profilesUpdated', this, this.profilesUpdated);
    port.on('render:profilesAdded', this, this.profilesAdded);
    port.send('render:watchProfiles');
  },

  deactivate: function() {
    this.get('port').off('render:profilesUpdated', this, this.profilesUpdated);
    this.get('port').off('render:profilesAdded', this, this.profilesAdded);
  },

  profilesUpdated: function(message) {
    this.set('controller.model', message.profiles);
  },

  profilesAdded: function(message) {
    var model = this.get('controller.model');
    model.pushObjects(message.profiles);
  },

  actions: {
    clearProfiles: function() {
      this.get('port').send('render:clear');
    }
  }

});
