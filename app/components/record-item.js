import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { isEmpty } from '@ember/utils';
const COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400'
};

export default Component.extend({
  /**
   * No tag. This component should not affect
   * the DOM.
   *
   * @property tagName
   * @type {String}
   * @default ''
   */
  tagName: '',

  modelTypeColumns: null,

  // TODO: Color record based on `color` property.
  style: computed('model.color', function() {
    let string = '';
    let colorName = this.get('model.color');
    if (!isEmpty(colorName)) {
      let color = COLOR_MAP[colorName];
      if (color) {
        string = `color: ${color};`;
      }
    }
    return htmlSafe(string);
  }),

  columns: computed('modelTypeColumns.[]', 'model.columnValues', function() {
    let columns = this.get('modelTypeColumns') || [];
    return columns.map(col => ({ name: col.name, value: this.get(`model.columnValues.${col.name}`) }));
  })
});
