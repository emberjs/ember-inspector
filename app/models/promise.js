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

  pendingBranch: function() {
    // if (!this.get('isSettled')) {
    //   return true;
    // }
    // if (this.get('children')) {
    //   for (var i = 0; i < this.get('children.length'); i++) {
    //     if (this.get('children').objectAt(i).get('pendingBranch')) {
    //       return true;
    //     }
    //   }
    // }
    return true;
  }.property('isSettled', 'children.@each.pendingBranch')


});


export default Promise;
