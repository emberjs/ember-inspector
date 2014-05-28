var debounce = Ember.run.debounce;

// Use this if you want a property to debounce
// another property with a certain delay
export default function(prop, delay, callback) {
  var value;

  var updateVal = function() {
    this.set(prop, value);
    callback.call(this);
  };

  return function(key, val) {
    if (arguments.length > 1) {
      value = val;
      debounce(this, updateVal, delay);
      return val;
    }
  }.property();

};
