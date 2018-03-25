import { computed } from '@ember/object';
import Component from '@ember/component';
import { htmlSafe } from '@ember/string';
import { not, bool, equal } from '@ember/object/computed';

export default Component.extend({
  item: null,
  tagName: '',

  init() {
    this._super(...arguments);
  },

  labelStyle: computed('item.parentCount', function() {
    return htmlSafe(
      `padding-left: ${+this.get('item.parentCount') * 25 + 10}px;`
    );
  }),

  actions: {
    toggleExpanded(item) {
      item.toggleProperty('expanded');
    },
  },
});
