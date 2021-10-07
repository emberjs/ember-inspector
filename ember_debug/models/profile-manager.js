import ProfileNode from './profile-node';

import { later, scheduleOnce } from '../utils/ember/runloop';

/**
 * A class for keeping track of active rendering profiles as a list.
 */
export default class ProfileManager {
  constructor() {
    this.profiles = [];
    this.current = null;
    this.currentSet = [];
    this._profilesAddedCallbacks = [];
    this.queue = [];
  }

  began(timestamp, payload, now) {
    return this.wrapForErrors(this, function () {
      this.current = new ProfileNode(timestamp, payload, this.current, now);
      return this.current;
    });
  }

  ended(timestamp, payload, profileNode) {
    if (payload.exception) {
      throw payload.exception;
    }
    return this.wrapForErrors(this, function () {
      this.current = profileNode.parent;
      profileNode.finish(timestamp);

      // Are we done profiling an entire tree?
      if (!this.current) {
        this.currentSet.push(profileNode);
        // If so, schedule an update of the profile list
        scheduleOnce('afterRender', this, this._profilesFinished);
      }
    });
  }

  wrapForErrors(context, callback) {
    return callback.call(context);
  }

  /**
   * Push a new profile into the queue
   * @param info
   * @return {number}
   */
  addToQueue(info) {
    const index = this.queue.push(info);
    if (index === 1) {
      later(this._flush.bind(this), 50);
    }
    return index - 1;
  }

  clearProfiles() {
    this.profiles.length = 0;
  }

  onProfilesAdded(context, callback) {
    this._profilesAddedCallbacks.push({ context, callback });
  }

  offProfilesAdded(context, callback) {
    let index = -1,
      item;
    for (let i = 0, l = this._profilesAddedCallbacks.length; i < l; i++) {
      item = this._profilesAddedCallbacks[i];
      if (item.context === context && item.callback === callback) {
        index = i;
      }
    }
    if (index > -1) {
      this._profilesAddedCallbacks.splice(index, 1);
    }
  }

  _flush() {
    let entry, i;
    for (i = 0; i < this.queue.length; i++) {
      entry = this.queue[i];
      if (entry.type === 'began') {
        // If there was an error during rendering `entry.endedIndex` never gets set.
        if (entry.endedIndex) {
          this.queue[entry.endedIndex].profileNode = this.began(
            entry.timestamp,
            entry.payload,
            entry.now
          );
        }
      } else {
        this.ended(entry.timestamp, entry.payload, entry.profileNode);
      }
    }
    this.queue.length = 0;
  }

  _profilesFinished() {
    return this.wrapForErrors(this, function () {
      const firstNode = this.currentSet[0];
      let parentNode = new ProfileNode(firstNode.start, {
        template: 'View Rendering',
      });

      parentNode.time = 0;
      this.currentSet.forEach((n) => {
        parentNode.time += n.time;
        parentNode.children.push(n);
      });
      parentNode.calcDuration();

      this.profiles.push(parentNode);
      this.profiles = this.profiles.slice(0, 100);
      this._triggerProfilesAdded([parentNode]);
      this.currentSet = [];
    });
  }

  _triggerProfilesAdded(profiles) {
    this._profilesAddedCallbacks.forEach(function (item) {
      item.callback.call(item.context, profiles);
    });
  }
}
