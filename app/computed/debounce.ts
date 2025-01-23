import { debounce } from '@ember/runloop';
import { computed } from '@ember/object';
import type { AnyFn } from '@ember/-internals/utility-types';

// Use this if you want a property to debounce
// another property with a certain delay.
// This means that every time this prop changes,
// the other prop will change to the same val after [delay]
export default function (prop: string, delay: number, callback?: AnyFn) {
  let value: unknown;

  const updateVal = function (this: any) {
    this.set(prop, value);
    if (callback) {
      callback.call(this);
    }
  };

  return computed({
    // eslint-disable-next-line ember/require-return-from-computed
    get() {},
    set(key, val) {
      value = val;
      // eslint-disable-next-line ember/no-runloop
      debounce(this, updateVal, delay);
      return val;
    },
  });
}
