import Ember from "ember";
const { run, computed } = Ember;
const { debounce } = run;

// Use this if you want a property to debounce
// another property with a certain delay.
// This means that every time this prop changes,
// the other prop will change to the same val after [delay]
export default function(prop, delay, callback) {
  let value;

  let updateVal = function() {
    this.set(prop, value);
    if (callback) {
      callback.call(this);
    }
  };

  return computed({
    get: function() {
      return this.get(prop);
    },
    set: function(key, val) {
      value = val;
      debounce(this, updateVal, delay);
      return val;
    }
  });

}
