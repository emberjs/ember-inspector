var Promise = Ember.Object.extend({
  init: function() {
    this.get('createdAt', new Date());
  },

  createdAt: null,

  parent: null,

  level: function() {
    var parent = this.get('parent');
    if (!parent) {
      return 0;
    }
    return parent.get('level') + 1;
  }.property('parent.level'),

  isSettled: function() {
    return this.get('isFulfilled') || this.get('isRejected');
  }.property('state'),

  isFulfilled: function() {
    return this.get('state') === 'fulfilled';
  }.property('state'),

  isRejected: function() {
    return this.get('state') === 'rejected';
  }.property('state'),

  children: function() {
    return [];
  }.property(),

  isPending: Ember.computed.not('isSettled'),

  pendingBranch: function() {
    return this.recursiveState('isPending', 'pendingBranch');
  }.property('isPending', 'children.@each.pendingBranch'),

  rejectedBranch: function() {
    return this.recursiveState('isRejected', 'rejectedBranch');
  }.property('isRejected', 'children.@each.rejectedBranch'),

  fulfilledBranch: function() {
    return this.recursiveState('isFulfilled', 'fulfilledBranch');
  }.property('isFulfilled', 'children.@each.fulfilledBranch'),

  recursiveState: function(prop, cp) {
    if (this.get(prop)) {
      return true;
    }
    if (this.get('children')) {
      for (var i = 0; i < this.get('children.length'); i++) {
        if (this.get('children').objectAt(i).get(cp)) {
          return true;
        }
      }
    }
    return false;
  },

  searchIndex: function() {
    var label = this.get('label') || '';
    if (this.get('children')) {
      for (var i = 0; i < this.get('children.length'); i++) {
        label += ' ' + this.get('children').objectAt(i).get('searchIndex');
      }
    }
    return label;
  }.property('label', 'children.@each.label'),

  matches: function(val) {
    return !!this.get('searchIndex').toLowerCase().match(new RegExp('.*' + escapeRegExp(val.toLowerCase()) + '.*'));
  },

  matchesExactly: function(val) {
    return !!this.get('label').toLowerCase().match(new RegExp('.*' + escapeRegExp(val.toLowerCase()) + '.*'));
  }


});

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


export default Promise;
