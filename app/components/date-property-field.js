import Ember from "ember";
import DatePicker from "ember-inspector/components/pikaday-input";
const { run: { once } } = Ember;
const KEY_EVENTS = {
  enter: 13,
  escape: 27
};

export default DatePicker.extend({
  attributeBindings: ['label:data-label'],

  openDatePicker: function() {
    once(this.$(), 'click');
  }.on('didInsertElement'),

  keyUp: function(e) {
    if (e.keyCode === KEY_EVENTS.enter) {
      this.insertNewline();
    } else if (e.keyCode === KEY_EVENTS.escape) {
      this.cancel();
    }
  },

  insertNewline: function() {
    this.sendAction('save-property');
    this.sendAction('finished-editing');
  },

  cancel: function() {
    this.sendAction('finished-editing');
  }
});
