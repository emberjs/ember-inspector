var isEmpty = Ember.isEmpty;
var pow = Math.pow;
var round = Math.round;

export default function(time) {
  if (time && !isNaN(+time)) {
    var formatted = time.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return formatted + 'ms';
  }

};
