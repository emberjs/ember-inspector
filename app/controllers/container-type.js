import Controller, { inject as controller } from '@ember/controller';
import { action, computed, get, set } from '@ember/object';
import debounceComputed from 'ember-inspector/computed/debounce';
import searchMatch from 'ember-inspector/utils/search-match';

export default Controller.extend({
  application: controller(),

  searchValue: debounceComputed('search', 300),

  search: null,

  rows: computed('model.@each.name', 'search', function() {
    return this.model
      .filter((instance) => searchMatch(get(instance, 'name'), this.search));
  }),

  init() {
    this._super(...arguments);

    this.columns = [{
      valuePath: 'name',
      name: 'Name'
    }];

    // By default, sort alphabetically
    this.sorts = [
      {
        valuePath: 'name',
        isAscending: true
      }
    ]
  },

  /**
   * Inspect an instance in the object inspector.
   * Called whenever an item in the list is clicked.
   *
   * @method inspectInstance
   * @param {Object} instance
   */
  inspectInstance: action(function(instance) {
    if (!get(instance, 'inspectable')) {
      return;
    }
    this.port.send('objectInspector:inspectByContainerLookup', {
      name: get(instance, 'fullName')
    });
  }),

  sendContainerToConsole: action(function() {
    this.port.send('objectInspector:sendContainerToConsole');
  }),

  @action
  updateSorts(sorts) {
    let hasExistingSort = this.sorts && this.sorts.length;
    let isDefaultSort = !sorts.length;

    if (hasExistingSort && isDefaultSort) {
      // override empty sorts with reversed previous sort
      let newSorts = [
        {
          valuePath: this.sorts[0].valuePath,
          isAscending: !this.sorts[0].isAscending,
        },
      ];
      set(this, 'sorts', newSorts);
      return;
    }

    set(this, 'sorts', sorts);
  }
});
