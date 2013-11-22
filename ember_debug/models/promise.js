var Promise = Ember.Object.extend({
  init: function() {
    this.set('createdAt', new Date());
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
  }.property('state')

});


export default Promise;
