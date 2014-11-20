import Ember from "ember";
var debounce = Ember.run.debounce;

// Use this if you want a property to debounce
// another property with a certain delay.
// This means that every time this prop changes,
// the other prop will change to the same val after [delay]
export default function(prop, delay, callback) {
  var value;

  var updateVal = function() {
    this.set(prop, value);
    if (callback) {
      callback.call(this);
    }
  };

  return function(key, val) {
    if (arguments.length > 1) {
      value = val;
      debounce(this, updateVal, delay);
      return val;
    }
  }.property();

}
