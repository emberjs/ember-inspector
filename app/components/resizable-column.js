import Component from '@ember/component';
import { action, computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
export default Component.extend({
  tagName: '',

  width: null,

  style: computed('width', function () {
    return htmlSafe(`-webkit-flex: none; flex: none; width: ${this.width}px;`);
  }),

  setWidth: action(function() {
    if (!this.width) {
      this.set('width', this.element.clientWidth);
    }
  }),
});
