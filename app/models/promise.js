var dateComputed = function() {
  return Ember.computed(
    function(key, date) {
      if (date !== undefined) {
        if (typeof date === 'date') {
          return date;
        } else if (typeof date === 'number' || typeof date === 'string') {
          return new Date(date);
        }
      }
      return null;
  }).property();
};

var Promise = Ember.Object.extend({
  createdAt: dateComputed(),
  settledAt: dateComputed(),

  parent: null,

  level: function() {
    var parent = this.get('parent');
    if (!parent) {
      return 0;
    }
    return parent.get('level') + 1;
  }.property('parent.level'),

  isSettled: Ember.computed.or('isFulfilled', 'isRejected'),

  isFulfilled: Ember.computed.equal('state', 'fulfilled'),

  isRejected: Ember.computed.equal('state', 'rejected'),

  isPending: Ember.computed.not('isSettled'),

  children: function() {
    return [];
  }.property(),

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
    for (var i = 0; i < this.get('children.length'); i++) {
      if (this.get('children').objectAt(i).get(cp)) {
        return true;
      }
    }
    return false;
  },

  // Need this observer because CP dependent keys do not support nested arrays
  // TODO: This can be so much better
  stateChanged: function() {
    if (!this.get('parent')) {
      return;
    }
    if (this.get('pendingBranch') && !this.get('parent.pendingBranch')) {
      this.get('parent').notifyPropertyChange('fulfilledBranch');
      this.get('parent').notifyPropertyChange('rejectedBranch');
      this.get('parent').notifyPropertyChange('pendingBranch');
    } else if (this.get('fulfilledBranch') && !this.get('parent.fulfilledBranch')) {
      this.get('parent').notifyPropertyChange('fulfilledBranch');
      this.get('parent').notifyPropertyChange('rejectedBranch');
      this.get('parent').notifyPropertyChange('pendingBranch');
    } else if (this.get('rejectedBranch') && !this.get('parent.rejectedBranch')) {
      this.get('parent').notifyPropertyChange('fulfilledBranch');
      this.get('parent').notifyPropertyChange('rejectedBranch');
      this.get('parent').notifyPropertyChange('pendingBranch');
    }

  }.observes('pendingBranch', 'fulfilledBranch', 'rejectedBranch'),

  searchIndex: function() {
    var label = this.get('label') || '';
    for (var i = 0; i < this.get('children.length'); i++) {
      label += ' ' + this.get('children').objectAt(i).get('searchIndex');
    }
    return label;
  }.property('label', 'children.@each.label'),

  matches: function(val) {
    return !!this.get('searchIndex').toLowerCase().match(new RegExp('.*' + escapeRegExp(val.toLowerCase()) + '.*'));
  },

  matchesExactly: function(val) {
    return !!((this.get('label') || '').toLowerCase().match(new RegExp('.*' + escapeRegExp(val.toLowerCase()) + '.*')));
  }


});

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


export default Promise;
