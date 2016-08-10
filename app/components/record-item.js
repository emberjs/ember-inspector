import Ember from 'ember';
const { Component, computed, String: { htmlSafe }, isEmpty } = Ember;
const COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400'
};

export default Component.extend({
  modelTypeColumns: null,

  classNames: ['list__row', 'list__row_highlight'],

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
  }),

  click() {
    this.sendAction('inspect', this.get('model'));
    return false;
  }
});
