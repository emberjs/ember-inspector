import DebugPort from './debug-port';
import ProfileManager from './models/profile-manager';

import { subscribe } from './utils/ember/instrumentation';

// Initial setup, that has to occur before the EmberObject init for some reason
let profileManager = new ProfileManager();
_subscribeToRenderEvents();

export default DebugPort.extend({
  namespace: null,
  portNamespace: 'render',

  profileManager,

  init() {
    this._super();

    this.profileManager.wrapForErrors = (context, callback) =>
      this.port.wrap(() => callback.call(context));
    this.profileManager.onProfilesAdded(this, this._updateComponentTree);
  },

  willDestroy() {
    this._super();

    this.profileManager.wrapForErrors = function (context, callback) {
      return callback.call(context);
    };

    this.profileManager.offProfilesAdded(this, this.sendAdded);
    this.profileManager.offProfilesAdded(this, this._updateComponentTree);
    this.profileManager.teardown();
  },

  sendAdded(profiles) {
    this.sendMessage('profilesAdded', {
      profiles,
      isHighlightSupported: this.profileManager.isHighlightEnabled,
    });
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
      this.sendMessage('profilesAdded', {
        profiles: this.profileManager.profiles,
      });
      this.profileManager.onProfilesAdded(this, this.sendAdded);
    },

    updateShouldHighlightRender({ shouldHighlightRender }) {
      this.profileManager.shouldHighlightRender = shouldHighlightRender;
    },
  },
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
        now: Date.now(),
      };
      return profileManager.addToQueue(info);
    },

    after(name, timestamp, payload, beganIndex) {
      const endedInfo = {
        type: 'ended',
        timestamp,
        payload,
      };

      const index = profileManager.addToQueue(endedInfo);
      profileManager.queue[beganIndex].endedIndex = index;
    },
  });
}
