import { isEmpty } from '@ember/utils';
import { observer, computed, get } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import escapeRegExp from "ember-inspector/utils/escape-reg-exp";
import { none, readOnly } from '@ember/object/computed';
import { dasherize } from '@ember/string';

export default Controller.extend({
  application: controller(),

  queryParams: ['filterValue', 'searchValue'],

  columns: readOnly('modelType.columns'),

  searchValue: '',

  filters: computed(() => []),

  filterValue: null,

  noFilterValue: none('filterValue'),

  modelChanged: observer('model', function() {
    this.set('searchValue', '');
  }),

  recordToString(record) {
    let search = '';
    let searchKeywords = get(record, 'searchKeywords');
    if (searchKeywords) {
      search = get(record, 'searchKeywords').join(' ');
    }
    return search.toLowerCase();
  },

  /**
   * The number of columns to show by default. Since a specific's model's
   * column count is unknown, we only show the first 5 by default.
   * The visibility can be modified on the list level itself.
   *
   * @property columnLimit
   * @type {Number}
   * @default 5
   */
  columnLimit: 5,

  /**
   * The lists's schema containing info about the list's columns.
   * This is usually a static object except in this case each model
   * type has different columns so we need to build it dynamically.
   *
   * The format is:
   * ```js
   * {
   *   columns: [{
   *     id: 'title',
   *     name: 'Title',
   *     visible: true
   *   }]
   * }
   * ```
   *
   * @property schema
   * @type {Object}
   */
  schema: computed('columns', function() {
    let columns = this.get('columns').map(({ desc }, index) => ({
      id: dasherize(desc),
      name: desc,
      visible: index < this.get('columnLimit')
    }));
    return { columns };
  }),

  filtered: computed('searchValue', 'model.@each.columnValues', 'model.@each.filterValues', 'filterValue', function() {
    let search = this.get('searchValue');
    let filter = this.get('filterValue');
    return this.get('model').filter(item => {
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

  actions: {
    /**
     * Called whenever the filter is updated.
     *
     * @method setFilter
     * @param {String} val
     */
    setFilter(val) {
      val = val || null;
      this.set('filterValue', val);
    },

    /**
     * Inspect a specific record. Called when a row
     * is clicked.
     *
     * @method inspectModel
     * @property {Object}
     */
    inspectModel(model) {
      this.get('port').send('data:inspectModel', { objectId: get(model, 'objectId') });
    }
  }
});
