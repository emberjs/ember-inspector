import { on } from '@ember/object/evented';
import { scheduleOnce } from '@ember/runloop';
import DatePicker from "ember-inspector/components/ember-flatpickr";
const KEY_EVENTS = {
  escape: 27
};

export default DatePicker.extend({
  openDatePicker: on('didInsertElement', function() {
    scheduleOnce('afterRender', this, function() {
      this.flatpickrRef.open();
    });
  }),

  keyUp(e) {
    if (e.keyCode === KEY_EVENTS.escape) {
      this.flatpickrRef.close();
    }
    return this._super(...arguments);
  }
});
