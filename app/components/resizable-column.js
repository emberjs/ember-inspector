import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
export default Component.extend({
  width: null,

  attributeBindings: ['style'],

  style: computed('width', function () {
    return htmlSafe(`-webkit-flex: none; flex: none; width: ${this.width}px;`);
  }),

  didInsertElement() {
    if (!this.width) {
      this.set('width', this.element.clientWidth);
    }
  }
});
