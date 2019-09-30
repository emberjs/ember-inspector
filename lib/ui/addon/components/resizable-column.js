import Component from '@ember/component';
import { action, computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import layout from '../templates/components/resizable-column';

export default Component.extend({
  layout,
  tagName: '',

  width: null,

  style: computed('width', function () {
    return htmlSafe(`-webkit-flex: none; flex: none; width: ${this.width}px;`);
  }),
});
