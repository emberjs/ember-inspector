import { scheduleOnce } from '@ember/runloop';
import DatePicker from 'ember-inspector/components/ember-flatpickr';
import { KEYS } from 'ember-inspector/utils/key-codes';

export default class DatePropertyFieldComponent extends DatePicker {
  didInsertElement() {
    super.didInsertElement(...arguments);

    scheduleOnce('afterRender', this, this._openFlatpickr);
  }

  keyUp(e) {
    if (e.keyCode === KEYS.escape) {
      this.flatpickrRef.close();
    }
    return super.keyUp(...arguments);
  }

  _openFlatpickr() {
    this.flatpickrRef.open();
  }
}
