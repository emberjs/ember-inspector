var Promise = Ember.RSVP.Promise;

export default Ember.Route.extend({

  model: function() {
    var port = this.get('port');
    port.send('render:getProfiles');
  },

  setupController: function(controller, model) {
    controller.set('model', model);
    this.get('port').on('render:profilesUpdated', this, this.profilesUpdated);
  },

  deactivate: function() {
    this.get('port').off('render:profilesUpdated', this, this.profilesUpdated);
  },

  profilesUpdated: function(message) {
    this.set('controller.model', message.profiles);
  },

  actions: {
    clearProfiles: function() {
      this.get('port').send('render:clear');
    }
  }

});
