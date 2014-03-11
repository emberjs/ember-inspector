/**
  A tree structure for assembling a list of render calls so they can be grouped and displayed nicely afterwards.

  @class ProfileNode
**/
var ProfileNode = function(start, payload, parent) {
  this.start = start;

  if (payload) {
    if (payload.template) { this.name = payload.template; }
    if (payload.object) { this.name = payload.object.toString(); }
  } else {
    this.name = "unknown view";
  }

  if (parent) { this.parent = parent; }
  this.children = [];
};

ProfileNode.prototype = {
  finish: function(timestamp) {
    this.time = (timestamp - this.start);
    this.calcDuration();

    // Once we attach to our parent, we remove that reference
    // to avoid a graph cycle when serializing:
    if (this.parent) {
      this.parent.children.push(this);
      this.parent = null;
    }
  },

  calcDuration: function() {
    this.duration = (Math.round(this.time * 100) / 100).toString() + "ms";
  }
};

export default ProfileNode;
