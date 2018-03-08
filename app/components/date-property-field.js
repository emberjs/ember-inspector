import { on } from '@ember/object/evented';
import { once } from '@ember/runloop';
import DatePicker from "ember-inspector/components/pikaday-input";
const KEY_EVENTS = {
  escape: 27
};

export default DatePicker.extend({
  /**
   * Workaround bug of `onPikadayClose` being called
   * on a destroyed component.
   */
  onPikadayClose() {
    if (!this.element) { return; }
    return this._super(...arguments);
  },

  openDatePicker: on('didInsertElement', function() {
    once(this.element, 'click');
  }),

  keyUp(e) {
    if (e.keyCode === KEY_EVENTS.escape) {
      this.sendAction('cancel');
    }
    return this._super(...arguments);
  }
});
