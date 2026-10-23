import Controller, { inject as controller } from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import debounced from 'ember-inspector/utils/debounced';
import searchMatch from 'ember-inspector/utils/search-match';

export default class ContainerTypeContoller extends Controller {
  @controller application;
  @service port;
  @service router;

  @tracked search = null;
  @tracked sorts;

  @debounced('search', 300) searchValue;

  get rows() {
    return this.model.filter((instance) =>
      searchMatch(instance.name, this.search),
    );
  }

  constructor() {
    super(...arguments);

    this.columns = [
      {
        valuePath: 'name',
        name: 'Name',
      },
    ];

    // By default, sort alphabetically
    this.sorts = [
      {
        property: 'name',
        direction: 'ascending',
      },
    ];
  }

  /**
   * Inspect an instance in the object inspector.
   * Called whenever an item in the list is clicked.
   *
   * @method inspectInstance
   * @param {Object} instance
   */
  @action
  inspectInstance(instance) {
    if (instance.inspectable) {
      this.port.send('objectInspector:inspectByContainerLookup', {
        name: instance.fullName,
      });
    }
  }

  @action
  refresh() {
    this.router.refresh('container-types');
  }

  @action
  sendContainerToConsole() {
    this.port.send('objectInspector:sendContainerToConsole');
  }

  @action
  updateSorts(sorts) {
    // The default sort has no meaning here, so force it to always be ascending
    //   or descending
    let isDefaultSort = !sorts.length;
    if (isDefaultSort) {
      let [{ property, direction }] = this.sorts;

      sorts = [
        {
          property,
          direction: direction === 'ascending' ? 'descending' : 'ascending',
        },
      ];
    }
    this.sorts = sorts;
  }
}
