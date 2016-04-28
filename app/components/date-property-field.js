import Ember from "ember";
import DatePicker from "ember-inspector/components/pikaday-input";
const { on, run: { once } } = Ember;
const KEY_EVENTS = {
  enter: 13,
  escape: 27
};

export default DatePicker.extend({
  openDatePicker: on('didInsertElement', function() {
    once(this.$(), 'click');
  }),

  keyUp(e) {
    if (e.keyCode === KEY_EVENTS.enter) {
      this.insertNewline();
    } else if (e.keyCode === KEY_EVENTS.escape) {
      this.cancel();
    }
  },

  insertNewline() {
    this.sendAction('save-property');
    this.sendAction('finished-editing');
  },

  cancel() {
    this.sendAction('finished-editing');
  }
});
