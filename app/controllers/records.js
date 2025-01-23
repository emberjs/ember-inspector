import { isEmpty } from '@ember/utils';
import { action, computed, get } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import escapeRegExp from 'ember-inspector/utils/escape-reg-exp';

export default class RecordsController extends Controller {
  @controller application;
  @service port;

  queryParams = ['filterValue', 'searchValue'];

  searchValue = '';
  filterValue = null;

  recordToString(record) {
    return (record.searchKeywords || []).join(' ').toLowerCase();
  }

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
  @computed('modelType.columns')
  get columns() {
    return this.modelType.columns.map(({ desc, name }) => ({
      valuePath: `columnValues.${name}`,
      name: desc,
    }));
  }

  @computed(
    'searchValue',
    'model.@each.{columnValues,filterValues}',
    'filterValue',
  )
  get filteredRecords() {
    let search = this.searchValue;
    let filter = this.filterValue;

    return this.model.filter((item) => {
      // check filters
      if (filter && !get(item, `filterValues.${filter}`)) {
        return false;
      }

      // check search
      if (!isEmpty(search)) {
        let searchString = this.recordToString(item);
        return !!searchString.match(
          new RegExp(`.*${escapeRegExp(search.toLowerCase())}.*`),
        );
      }
      return true;
    });
  }

  constructor() {
    super(...arguments);

    this.filters = [];
    this.sorts = undefined;
  }

  @action
  setFilter(val) {
    val = val || null;
    this.set('filterValue', val);
  }

  @action
  inspectModel([record]) {
    this.set('selection', record);
    this.port.send('data:inspectModel', { objectId: record.objectId });
  }

  @action
  updateSorts(newSorts) {
    this.set('sorts', newSorts);
  }
}
