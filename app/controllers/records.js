import { isEmpty } from '@ember/utils';
// eslint-disable-next-line ember/no-observers
import { action, observer, computed, get } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import escapeRegExp from "ember-inspector/utils/escape-reg-exp";

export default Controller.extend({
  application: controller(),

  queryParams: ['filterValue', 'searchValue'],

  searchValue: '',

  filterValue: null,

  // eslint-disable-next-line ember/no-observers
  modelChanged: observer('model', function() {
    this.set('searchValue', '');
  }),

  recordToString(record) {
    return (
      get(record, 'searchKeywords') || []
    ).join(' ').toLowerCase();
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
    let search = this.searchValue;
    let filter = this.filterValue;

    return this.model.filter(item => {
      // check filters
      if (filter && !get(item, `filterValues.${filter}`)) {
        return false;
      }

      // check search
      if (!isEmpty(search)) {
        let searchString = this.recordToString(item);
        return !!searchString.match(new RegExp(`.*${escapeRegExp(search.toLowerCase())}.*`));
      }
      return true;
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
