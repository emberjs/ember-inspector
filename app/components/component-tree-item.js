import { computed } from '@ember/object';
import Component from '@ember/component';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  item: null,
  tagName: '',
  activeSearch: false,

  labelStyle: computed('item.parentCount', function() {
    let expanderOffset = this.get('item.hasChildren') ? 10 : 0;
    let padding = this.get('item.parentCount') * 25 - expanderOffset;
    return htmlSafe(`padding-left: ${padding}px;`);
  }),

  actions: {
    toggleExpanded(item) {
      item.toggleProperty('expanded');
    },
  },
});
