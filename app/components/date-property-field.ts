import { scheduleOnce } from '@ember/runloop';
import { action } from '@ember/object';
import DatePicker from 'ember-flatpickr/components/ember-flatpickr';

export default class DatePropertyFieldComponent extends DatePicker {
  @action
  onInsert(element: HTMLInputElement) {
    super.onInsert(element);

    // eslint-disable-next-line ember/no-runloop
    scheduleOnce('afterRender', this, this._openFlatpickr);
  }

  _openFlatpickr = () => {
    this.flatpickrRef?.open();
  };
}
