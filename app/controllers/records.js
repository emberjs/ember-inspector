import { isEmpty } from '@ember/utils';
import { observer, computed, get, set } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import escapeRegExp from "ember-inspector/utils/escape-reg-exp";
import { none } from '@ember/object/computed';

export default Controller.extend({
  application: controller(),

  queryParams: ['filterValue', 'searchValue'],

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
   * ```
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
    inspectModel([record]) {
      set(this, 'selection', record);
      this.get('port').send('data:inspectModel', { objectId: get(record, 'objectId') });
    }
  }
});
