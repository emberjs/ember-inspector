import Ember from 'ember';

export function msToTime(params/*, hash*/) {
  let [time] = params;
  if (time && !isNaN(+time)) {
    let formatted = time.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return formatted + 'ms';
  }
}

export default Ember.Helper.helper(msToTime);
