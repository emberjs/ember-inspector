import { scheduleOnce } from '@ember/runloop';
import DatePicker from 'ember-inspector/components/ember-flatpickr';

const KEY_EVENTS = {
  escape: 27
};

export default DatePicker.extend({
  didInsertElement() {
    this._super(...arguments);

    scheduleOnce('afterRender', this, function() {
      this.flatpickrRef.open();
    });
  },

  keyUp(e) {
    if (e.keyCode === KEY_EVENTS.escape) {
      this.flatpickrRef.close();
    }
    return this._super(...arguments);
  }
});
