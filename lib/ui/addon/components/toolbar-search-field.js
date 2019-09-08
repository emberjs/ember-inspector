import { action } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/toolbar-search-field';

let uuid = 0;

export default Component.extend({
  layout,
  tagName: '',

  init() {
    this._super(...arguments);
    this.inputId = `toolbar-search-field-input-${uuid++}`;
  },

  clear: action(function() {
    document.querySelector('#' + this.inputId).focus();
    this.set('value', '');
  })
});
