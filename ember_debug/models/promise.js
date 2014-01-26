var dateComputed = function() {
  return Ember.computed(
    function(key, date) {
      if (date !== undefined) {
        if (date instanceof Date) {
          return date;
        } else if (typeof date === 'number' || typeof date === 'string') {
          return new Date(date);
        }
      }
      return null;
  }).property();
};

export default Ember.Object.extend({
  createdAt: dateComputed(),
  settledAt: dateComputed(),
  chainedAt: dateComputed(),

  parent: null,

  children: Ember.computed(function() {
    return Ember.A();
  }).property(),

  level: Ember.computed(function() {
    var parent = this.get('parent');
    if (!parent) {
      return 0;
    }
    return parent.get('level') + 1;
  }).property('parent.level'),

  isSettled: Ember.computed(function() {
    return this.get('isFulfilled') || this.get('isRejected');
  }).property('state'),

  isFulfilled: Ember.computed(function() {
    return this.get('state') === 'fulfilled';
  }).property('state'),

  isRejected: Ember.computed(function() {
    return this.get('state') === 'rejected';
  }).property('state')

});
