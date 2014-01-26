export default Ember.TextField.extend({
  attributeBindings: ['label:data-label'],

  saveProperty: 'saveProperty',
  finishedEditing: 'finishedEditing',

  didInsertElement: function() {
    this._super();
    this.$().select();
  },

  insertNewline: function() {
    this.sendAction('saveProperty');
    this.sendAction('finishedEditing');
  },

  cancel: function() {
    this.sendAction('finishedEditing');
  },

  focusOut: function() {
    this.sendAction('finishedEditing');
  }
});
