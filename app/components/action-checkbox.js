import Component from '@ember/component';

export default Component.extend({
  tagName: 'input',
  attributeBindings: ['type', 'checked'],
  type: 'checkbox',

  checked: false,

  change() {
    this._updateElementValue();
  },

  _updateElementValue() {
    this.set('checked', this.element.checked);
    this.onUpdate(this.get('checked'));
  }
});
