import PortMixin from "mixins/port_mixin";
import ProfileManager from 'models/profile_manager';

var profileManager = new ProfileManager();

Ember.subscribe("render", {
  before: function(name, timestamp, payload) {
    return profileManager.began(timestamp, payload);
  },

  after: function(name, timestamp, payload, profileNode) {
    return profileManager.ended(timestamp, payload, profileNode);
  }
});

export default Ember.Object.extend(PortMixin, {
  namespace: null,
  port: Ember.computed.alias('namespace.port'),
  application: Ember.computed.alias('namespace.application'),
  promiseDebug: Ember.computed.alias('namespace.promiseDebug'),
  portNamespace: 'render',

  init: function() {
    this._super();
    this.set('profiles', profileManager.profiles);
  },

  _profilesChanged: function() {
    this.sendMessage('profilesUpdated', {profiles: this.get('profiles')});
  }.observes('profiles.@each'),

  messages: {
    getProfiles: function() {
      this.sendMessage('profilesUpdated', {profiles: this.get('profiles')});
    },

    clear: function() {
      this.get('profiles').clear();
      this.sendMessage('profilesUpdated', {profiles: this.get('profiles')});
    }
  }
});
