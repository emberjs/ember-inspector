import { isEmpty } from '@ember/utils';
import { action, get, set } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import escapeRegExp from '../utils/escape-reg-exp';

export default class RecordsController extends Controller {
  queryParams = ['filterValue', 'searchValue'];

  @controller application;
  @service port;

  @tracked filterValue = null;
  @tracked filters = [];
  @tracked modelType;
  @tracked searchValue = '';
  @tracked sorts = undefined;

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
  get columns() {
    return this.modelType.columns.map(({ desc, name }) => ({
      valuePath: `columnValues.${name}`,
      name: desc,
    }));
  }

  get filteredRecords() {
    const search = this.searchValue;
    const filter = this.filterValue;

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

  @action
  setFilter(val) {
    val = val || null;
    this.filterValue = val;
  }

  @action
  inspectModel([record]) {
    set(this, 'selection', record);
    this.port.send('data:inspectModel', { objectId: record.objectId });
  }

  @action
  updateSorts(newSorts) {
    this.sorts = newSorts;
  }
}
