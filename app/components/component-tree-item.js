import { computed } from '@ember/object';
import Component from '@ember/component';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  item: null,
  tagName: '',

  labelStyle: computed('item.parentCount', function() {
    let expanderOffset = this.get('item.hasChildren') ? 12 : 0;
    let padding = this.get('item.parentCount') * 20 - expanderOffset + 25;
    return htmlSafe(`padding-left: ${padding}px;`);
  }),

  hasElement: computed('item', function() {
    return this.get('item.view.tagName') !== '';
  })
});
