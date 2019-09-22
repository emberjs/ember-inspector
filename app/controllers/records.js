import { isEmpty } from '@ember/utils';
import { action, observer, computed, get } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import escapeRegExp from "ember-inspector/utils/escape-reg-exp";

export default Controller.extend({
  application: controller(),

  queryParams: ['filterValue', 'searchValue'],

  searchValue: '',

  filterValue: null,

  modelChanged: observer('model', function() {
    this.set('searchValue', '');
  }),

  recordToString(record) {
    return (
      get(record, 'searchKeywords') || []
    ).join(' ').toLowerCase();
  },

  passesFilter(record) {
    if(!this.filterValue) {
      return true;
    }

    return get(record, `filterValues.${this.filterValue}`);
  },

  passesSearch(record) {
    if (isEmpty(this.searchValue)) {
      return true;
    }

    const exp = `.*${escapeRegExp(this.searchValue.toLowerCase())}.*`;
    return !!this.recordToString(record).match(new RegExp(exp));
  },

  /**
   * The lists's schema containing info about the list's columns.
   * This is usually a static object except in this case each model
   * type has different columns so we need to build it dynamically.
   *
   * The format is:
   * ```js
   *   [{
   *     valuePath: 'title',
   *     name: 'Title'
   *   }]
   *
   * @property schema
   * @type {Object}
   */
  columns: computed('modelType.columns', function() {
    return this.get('modelType.columns').map(({ desc, name }) => ({
      valuePath: `columnValues.${name}`,
      name: desc
    }));
  }),

  filteredRecords: computed('searchValue', 'model.@each.{columnValues,filterValues}', 'filterValue', function() {
    return this.model.filter((record) => {
      return this.passesFilter(record) && this.passesSearch(record);
    });
  }),

  init() {
    this._super(...arguments);

    this.filters = [];
  },

  setFilter: action(function(val) {
    val = val || null;
    this.set('filterValue', val);
  }),

  inspectModel: action(function([record]) {
    this.set('selection', record);
    this.port.send('data:inspectModel', { objectId: get(record, 'objectId') });
  }),
});
