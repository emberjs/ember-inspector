import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { action, computed, set } from '@ember/object';
import debounceComputed from 'ember-inspector/computed/debounce';
import searchMatch from 'ember-inspector/utils/search-match';

export default Controller.extend({
  application: controller(),
  port: service(),

  searchValue: debounceComputed('search', 300),

  search: null,

  rows: computed('model.@each.name', 'search', function () {
    return this.model.filter((instance) =>
      searchMatch(instance.name, this.search)
    );
  }),

  init() {
    this._super(...arguments);

    this.columns = [
      {
        valuePath: 'name',
        name: 'Name',
      },
    ];

    // By default, sort alphabetically
    this.sorts = [
      {
        valuePath: 'name',
        isAscending: true,
      },
    ];
  },

  /**
   * Inspect an instance in the object inspector.
   * Called whenever an item in the list is clicked.
   *
   * @method inspectInstance
   * @param {Object} instance
   */
  inspectInstance: action(function (instance) {
    if (instance.inspectable) {
      this.port.send('objectInspector:inspectByContainerLookup', {
        name: instance.fullName,
      });
    }
  }),

  sendContainerToConsole: action(function () {
    this.port.send('objectInspector:sendContainerToConsole');
  }),

  @action
  updateSorts(sorts) {
    // The default sort has no meaning here, so force it to always be ascending
    //   or descending
    let isDefaultSort = !sorts.length;
    if (isDefaultSort) {
      sorts = [
        {
          valuePath: this.sorts[0].valuePath,
          isAscending: !this.sorts[0].isAscending,
        },
      ];
    }
    set(this, 'sorts', sorts);
  },
});
