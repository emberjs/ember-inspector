import Ember from 'ember';
const { Component, computed, isEmpty } = Ember;
const COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400'
};

export default Component.extend({
  modelTypeColumns: null,

  classNames: ['list-tree__item', 'row', 'row_highlight'],

  attributeBindings: ['label:data-label'],

  label: 'record-row',

  // TODO: Color record based on `color` property.
  style: computed('model.color', function() {
    let colorName = this.get('model.color');
    if (!isEmpty(colorName)) {
      let color = COLOR_MAP[colorName];
      if (color) {
        return Ember.String.htmlSafe(`color: ${color};`);
      }
    }
    return Ember.String.htmlSafe('');
  }),

  columns: computed('modelTypeColumns.[]', 'model.columnValues', function() {
    let columns = this.get('modelTypeColumns') || [];
    return columns.map(col => {
      return { name: col.name, value: this.get('model.columnValues.' + col.name) };
    });
  }),

  click() {
    this.sendAction('inspect', this.get('model'));
    return false;
  }
});
