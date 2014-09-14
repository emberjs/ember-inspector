/**
  A tree structure for assembling a list of render calls so they can be grouped and displayed nicely afterwards.

  @class ProfileNode
**/
var get = Ember.get;
var guidFor = Ember.guidFor;

var ProfileNode = function(start, payload, parent, now) {
  var name;
  this.start = start;
  this.timestamp = now || Date.now();

  if (payload) {
    if (payload.template) {
      name = payload.template;
    } else if (payload.view) {
      var view = payload.view;
      name = get(view, 'instrumentDisplay') || get(view, '_debugContainerKey');
      if (name) {
        name = name.replace(/^view:/, '');
      }
      this.viewGuid = guidFor(view);
    }

    if (!name && payload.object) {
      name = payload.object.toString().replace(/:?:ember\d+>$/, '').replace(/^</, '');
      if (!this.viewGuid) {
        var match = name.match(/:(ember\d+)>$/);
        if (match && match.length > 1) {
          this.viewGuid = match[1];
        }
      }
    }
  }

  this.name = name || 'Unknown view';

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
    this.duration = Math.round(this.time * 100) / 100;
  }
};

export default ProfileNode;
