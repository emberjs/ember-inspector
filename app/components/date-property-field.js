import { scheduleOnce } from '@ember/runloop';
import DatePicker from 'ember-inspector/components/ember-flatpickr';
import { KEYS } from 'ember-inspector/utils/key-codes';

export default DatePicker.extend({
  didInsertElement() {
    this._super(...arguments);

    scheduleOnce('afterRender', this, this._openFlatpickr);
  },

  keyUp(e) {
    if (e.keyCode === KEYS.escape) {
      this.flatpickrRef.close();
    }
    return this._super(...arguments);
  },

  _openFlatpickr() {
    this.flatpickrRef.open();
  },
});
