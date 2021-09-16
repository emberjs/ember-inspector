// eslint-disable-next-line ember/no-mixins
import PortMixin from 'ember-debug/mixins/port-mixin';
import ProfileManager from './models/profile-manager';

import EmberObject from './utils/ember/object';
import { subscribe } from './utils/ember/instrumentation';

// Initial setup, that has to occur before the EmberObject init for some reason
let profileManager = new ProfileManager();
_subscribeToRenderEvents();

export default EmberObject.extend(PortMixin, {
  namespace: null,
  portNamespace: 'render',
  shouldHighlightRender: false,

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
  },

  sendAdded(profiles) {
    if (this.shouldHighlightRender) {
      profiles.forEach((profile) => {
        this._hightLightNode(profile);
      });
    }
    this.sendMessage('profilesAdded', { profiles });
  },

  _hightLightNode({ viewGuid, children }) {
    const hasChildren = children?.length > 0;
    if (viewGuid) {
      this._createOutline(viewGuid, hasChildren);
    }
    if (hasChildren) {
      children.forEach((childNode) => {
        this._hightLightNode(childNode);
      });
    }
  },

  _createOutline(viewGuid, hasChildren) {
    const element = document.getElementById(viewGuid);
    if (element) {
      const outline = element.style.outline;
      element.style.outline = `${hasChildren ? '0.5' : '1'}px solid ${
        hasChildren ? 'blue' : 'red'
      }`;
      setTimeout(() => {
        element.style.outline = outline ?? 'none';
      }, 1000);
    }
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
      this.shouldHighlightRender = shouldHighlightRender;
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
