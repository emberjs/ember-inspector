import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default Component.extend({
  tagName: '',

  width: null,

  style: computed('width', function () {
    return htmlSafe(`-webkit-flex: none; flex: none; width: ${this.width}px;`);
  }),
});
