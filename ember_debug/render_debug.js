import PortMixin from "mixins/port_mixin";
import ProfileManager from 'models/profile_manager';

var K = Ember.K;
var addArrayObserver = Ember.addArrayObserver;
var computed = Ember.computed;
var oneWay = computed.oneWay;

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
  port: oneWay('namespace.port').readOnly(),
  application: oneWay('namespace.application').readOnly(),
  viewDebug: oneWay('namespace.viewDebug').readOnly(),
  portNamespace: 'render',

  profileManager: profileManager,

  init: function() {
    this._super();
    this._subscribeForViewTrees();
  },

  willDestroy: function() {
    this._super();
    this.profileManager.offProfilesAdded(this, this.sendAdded);
    this.profileManager.offProfilesAdded(this, this._updateViewTree);
  },

  _subscribeForViewTrees: function() {
    this.profileManager.onProfilesAdded(this, this._updateViewTree);
  },

  _updateViewTree: function(profiles) {
    var viewDurations = {};
    this._flatten(profiles).forEach(function(node) {
      if (node.viewGuid) {
        viewDurations[node.viewGuid] = node.duration;
      }
    });
    this.get('viewDebug').updateDurations(viewDurations);
  },

  _flatten: function(profiles, array) {
    var self = this;
    array = array || [];
    profiles.forEach(function(profile) {
      array.push(profile);
      self._flatten(profile.children, array);
    });
    return array;
  },

  sendAdded: function(profiles) {
    this.sendMessage('profilesAdded', { profiles: profiles });
  },

  messages: {
    watchProfiles: function() {
      this.sendMessage('profilesAdded', { profiles: this.profileManager.profiles });
      this.profileManager.onProfilesAdded(this, this.sendAdded);
    },

    releaseProfiles: function() {
      this.profileManager.offProfilesAdded(this, this.sendAdded);
    },

    clear: function() {
      this.profileManager.clearProfiles();
      this.sendMessage('profilesUpdated', {profiles: []});
    }
  }
});
