import Ember from "ember";
export default Ember.TextField.extend({
  attributeBindings: ['label:data-label'],

  didInsertElement: function() {
    this._super();
    this.$().select();
  },

  insertNewline: function() {
    this.sendAction('save-property');
    this.sendAction('finished-editing');
  },

  cancel: function() {
    this.sendAction('finished-editing');
  },

  focusOut: function() {
    this.sendAction('finished-editing');
  }
});
