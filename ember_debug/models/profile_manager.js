import ProfileNode from 'models/profile_node';

/**
 * A class for keeping track of active rendering profiles as a list.
 */
var ProfileManager = function() {
  this.profiles = Em.A();
  this.current = null;
  this.currentSet = [];
  this._profilesAddedCallbacks = [];
};

ProfileManager.prototype = {
  began: function(timestamp, payload) {
    this.current = new ProfileNode(timestamp, payload, this.current);
    return this.current;
  },

  ended: function(timestamp, payload, profileNode) {
    if (payload.exception) { throw payload.exception; }

    profileNode.finish(timestamp);
    this.current = profileNode.parent;

    // Are we done profiling an entire tree?
    if (!this.current) {
      this.currentSet.push(profileNode);
      // If so, schedule an update of the profile list
      Em.run.scheduleOnce('afterRender', this, this._profilesFinished);
    }
  },

  _profilesFinished: function() {
    var firstNode = this.currentSet[0],
        parentNode = new ProfileNode(firstNode.start, {template: 'View Rendering'});

    parentNode.time = 0;
    this.currentSet.forEach(function(n) {
      parentNode.time += n.time;
      parentNode.children.push(n);
    });
    parentNode.calcDuration();

    this.profiles.pushObject(parentNode);
    this._triggerProfilesAdded([parentNode]);
    this.currentSet = [];
  },

  _profilesAddedCallbacks: undefined, // set to array on init

  onProfilesAdded: function(context, callback) {
    this._profilesAddedCallbacks.push({
      context: context,
      callback: callback
    });
  },

  offProfilesAdded: function(context, callback) {
    var index = -1, item;
    for (var i = 0, l = this._profilesAddedCallbacks.length; i < l; i++) {
      item = this._profilesAddedCallbacks[i];
      if (item.context === context && item.callback === callback) {
        index = i;
      }
    }
    if (index > -1) {
      this._profilesAddedCallbacks.splice(index, 1);
    }
  },

  _triggerProfilesAdded: function(profiles) {
    this._profilesAddedCallbacks.forEach(function(item) {
      item.callback.call(item.context, profiles);
    });
  }
};

export default ProfileManager;
