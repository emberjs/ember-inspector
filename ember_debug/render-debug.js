import PortMixin from 'ember-debug/mixins/port-mixin';
import ProfileManager from 'ember-debug/models/profile-manager';
import { addToQueue, flatten } from './utils/render-utils';

const Ember = window.Ember;
const { computed: { readOnly }, subscribe, Object: EmberObject } = Ember;

let profileManager = new ProfileManager();
let queue = [];

export default EmberObject.extend(PortMixin, {
  namespace: null,
  viewDebug: readOnly('namespace.viewDebug'),
  portNamespace: 'render',

  profileManager,

  init() {
    this._super();

    this._subscribeToRenderEvents();
    this.profileManager.wrapForErrors = (context, callback) => this.get('port').wrap(() => callback.call(context));
    this.profileManager.onProfilesAdded(this, this._updateViewRenderPerformance);
  },

  willDestroy() {
    this._super();

    this.profileManager.wrapForErrors = function(context, callback) {
      return callback.call(context);
    };
    this.profileManager.offProfilesAdded(this, this.sendAdded);
    this.profileManager.offProfilesAdded(this, this._updateViewRenderPerformance);
  },

  sendAdded(profiles) {
    this.sendMessage('profilesAdded', { profiles });
  },

  /**
   * This subscribes to render events, so every time the page rerenders, it will push a new profile
   * @return {*}
   * @private
   */
  _subscribeToRenderEvents() {
    subscribe('render', {
      before: (name, timestamp, payload) => {
        const info = {
          type: 'began',
          timestamp,
          payload,
          now: Date.now()
        };

        return addToQueue(info, queue, this.profileManager);
      },

      after: (name, timestamp, payload, beganIndex) => {
        const endedInfo = {
          type: 'ended',
          timestamp,
          payload
        };

        queue[beganIndex].endedIndex = addToQueue(endedInfo, queue, this.profileManager);

        // If rendering a component, update the component tree
        if (name === 'render.component') {
          this._updateComponentTree();
        }
      }
    });
  },

  /**
   * Updates Render Performance tab durations
   * @param profiles
   * @private
   */
  _updateViewRenderPerformance(profiles) {
    let viewDurations = {};
    flatten(profiles).forEach(node => {
      if (node.viewGuid) {
        viewDurations[node.viewGuid] = node.duration;
      }
    });
    this.get('viewDebug').updateDurations(viewDurations);
  },

  /**
   * Update the components tree. Called on each `render.component` event.
   * @private
   */
  _updateComponentTree() {
    this.get('viewDebug').sendTree();
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
