import ProfileManager from 'ember-debug/models/profile-manager';

const Ember = window.Ember;
const { run: { later } } = Ember;

let profileManager, queue;

export function setupQueue() {
  profileManager = new ProfileManager();
  queue = [];

  return { profileManager, queue };
}

/**
 * Recursively flatten all profiles and their children
 * @param {Profile[]} profiles An array of profiles
 * @param {Array} array The array to hold the flattened profiles
 * @return {*|Array}
 */
export function flatten(profiles, array = []) {
  profiles.forEach(profile => {
    array.push(profile);
    flatten(profile.children, array);
  });
  return array;
}

/**
 * Push a new profile into the queue
 * @param info
 * @return {number}
 */
export function addToQueue(info) {
  const index = queue.push(info);
  if (index === 1) {
    later(_flush, 50);
  }
  return index - 1;
}

function _flush() {
  let entry, i;
  for (i = 0; i < queue.length; i++) {
    entry = queue[i];
    if (entry.type === 'began') {
      // If there was an error during rendering `entry.endedIndex` never gets set.
      if (entry.endedIndex) {
        queue[entry.endedIndex].profileNode = profileManager.began(entry.timestamp, entry.payload, entry.now);
      }
    } else {
      profileManager.ended(entry.timestamp, entry.payload, entry.profileNode);
    }

  }
  queue.length = 0;
}

