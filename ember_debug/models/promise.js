import { typeOf } from 'ember-debug/utils/type-check';

import { A } from '@ember/array';
import EmberObject, { computed } from '@ember/object';
import { equal, or } from '@ember/object/computed';

const dateComputed = function () {
  return computed({
    get() {
      return null;
    },
    set(key, date) {
      if (typeOf(date) === 'date') {
        return date;
      } else if (typeof date === 'number' || typeof date === 'string') {
        return new Date(date);
      }
      return null;
    },
  });
};

export default EmberObject.extend({
  createdAt: dateComputed(),
  settledAt: dateComputed(),
  chainedAt: dateComputed(),

  parent: null,

  children: computed(function () {
    return A();
  }),

  level: computed('parent.level', function () {
    const parent = this.parent;
    if (!parent) {
      return 0;
    }
    return parent.get('level') + 1;
  }),

  isSettled: or('isFulfilled', 'isRejected'),

  isFulfilled: equal('state', 'fulfilled'),

  isRejected: equal('state', 'rejected'),
});
