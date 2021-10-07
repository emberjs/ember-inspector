import { scheduleOnce } from '@ember/runloop';
import { action } from '@ember/object';
import DatePicker from 'ember-inspector/components/ember-flatpickr';
// import { KEYS } from 'ember-inspector/utils/key-codes';

export default class DatePropertyFieldComponent extends DatePicker {
  @action
  onInsert(element) {
    super.onInsert(element);

    scheduleOnce('afterRender', this, this._openFlatpickr);
  }

  // TODO: Add back close with esc key support
  // keyUp(e) {
  //   if (e.keyCode === KEYS.escape) {
  //     this.flatpickrRef.close();
  //   }
  //   return super.keyUp(...arguments);
  // }

  _openFlatpickr() {
    this.flatpickrRef.open();
  }
}
