import PortMixin from 'ember-debug/mixins/port-mixin';
import ProfileManager from './models/profile-manager';

const Ember = window.Ember;
const { subscribe, Object: EmberObject } = Ember;

// Initial setup, that has to occur before the EmberObject init for some reason
let profileManager = new ProfileManager();
_subscribeToRenderEvents();

export default EmberObject.extend(PortMixin, {
  namespace: null,
  portNamespace: 'render',

  profileManager,

  init() {
    this._super();

    this.profileManager.wrapForErrors = (context, callback) => this.get('port').wrap(() => callback.call(context));
    this.profileManager.onProfilesAdded(this, this._updateComponentTree);
  },

  willDestroy() {
    this._super();

    this.profileManager.wrapForErrors = function(context, callback) {
      return callback.call(context);
    };

    this.profileManager.offProfilesAdded(this, this.sendAdded);
    this.profileManager.offProfilesAdded(this, this._updateRenderPerformanceAndComponentTree);
  },

  sendAdded(profiles) {
    this.sendMessage('profilesAdded', { profiles });
  },

  /**
   * Update the components tree. Called on each `render.component` event.
   * @private
   */
  _updateComponentTree() {
    this.namespace.viewDebug.sendTree();
  },

  messages: {
    clear() {
      this.profileManager.clearProfiles();
      this.sendMessage('profilesUpdated', { profiles: [] });
    },

    releaseProfiles() {
      this.profileManager.offProfilesAdded(this, this.sendAdded);
    },

    watchProfiles() {
      this.sendMessage('profilesAdded', { profiles: this.profileManager.profiles });
      this.profileManager.onProfilesAdded(this, this.sendAdded);
    }
  }
});

/**
 * This subscribes to render events, so every time the page rerenders, it will push a new profile
 * @return {*}
 * @private
 */
function _subscribeToRenderEvents() {
  subscribe('render', {
    before(name, timestamp, payload) {
      const info = {
        type: 'began',
        timestamp,
        payload,
        now: Date.now()
      };

      return profileManager.addToQueue(info);
    },

    after(name, timestamp, payload, beganIndex) {
      const endedInfo = {
        type: 'ended',
        timestamp,
        payload
      };

      const index = profileManager.addToQueue(endedInfo);
      profileManager.queue[beganIndex].endedIndex = index;
    }
  });
}
