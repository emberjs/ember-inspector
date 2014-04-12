var isEmpty = Ember.isEmpty;
var pow = Math.pow;
var round = Math.round;

export default function(seconds) {
  var min = Math.floor(seconds / (1000 * 60));
  seconds -= min * 1000 * 60;
  var sec = Math.floor(seconds / 1000);
  seconds -= sec * 1000;
  var ms = seconds;
  var val = '';
  if (min > 0) {
    val += min + 'min ';
  }
  if (sec > 0) {
    val += sec + 's ';
  }
  if (ms > 0 || isEmpty(val)) {
    val += ms + 'ms';
  }
  return val;
};
