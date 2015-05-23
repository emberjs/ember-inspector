export default function(time) {
  if (time && !isNaN(+time)) {
    let formatted = time.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return formatted + 'ms';
  }

}
