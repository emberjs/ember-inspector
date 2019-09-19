import { action, get, computed } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import debounceComputed from 'ember-inspector/computed/debounce';
import searchMatch from 'ember-inspector/utils/search-match';

export default Controller.extend({
  application: controller(),

  searchValue: debounceComputed('search', 300),

  search: null,

  filtered: computed('model.@each.name', 'search', function() {
    return this.model
      .filter((item) => searchMatch(get(item, 'name'), this.search));
  }),

  rows: computed('filtered.[]', function() {
    return this.filtered.map(function(item) {
      return {
        name: item
      };
    });
  }),

  init() {
    this._super(...arguments);

    this.columns = [{
      valuePath: 'name',
      name: 'Name'
    }];

    this.sortProperties = ['name'];
  },

  /**
   * Inspect an instance in the object inspector.
   * Called whenever an item in the list is clicked.
   *
   * @method inspectInstance
   * @param {Object} obj
   */
  inspectInstance: action(function(obj) {
    if (!get(obj, 'inspectable')) {
      return;
    }
    this.port.send('objectInspector:inspectByContainerLookup', {
      name: get(obj, 'fullName')
    });
  }),

  sendContainerToConsole: action(function() {
    this.port.send('objectInspector:sendContainerToConsole');
  }),
});
