import Ember from 'ember';
var Component = Ember.Component;

export default Component.extend({
  tagName: 'input',
  attributeBindings: ['type', 'checked'],
  type: 'checkbox',

  checked: false,

  change() {
    this._updateElementValue();
  },

  _updateElementValue() {
    this.set('checked', this.$().prop('checked'));
    this.sendAction('on-update', this.get('checked'));
  }
});
