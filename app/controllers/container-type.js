import { get } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import debounceComputed from "ember-inspector/computed/debounce";
import searchMatch from "ember-inspector/utils/search-match";
import { filter } from '@ember/object/computed';

export default Controller.extend({
  application: controller(),

  sortProperties: ['name'],

  searchValue: debounceComputed('search', 300),

  search: null,

  filtered: filter('model', function(item) {
    return searchMatch(get(item, 'name'), this.get('search'));
  }).property('model.@each.name', 'search'),

  actions: {
    /**
     * Inspect an instance in the object inspector.
     * Called whenever an item in the list is clicked.
     *
     * @method inspectInstance
     * @param {Object} obj
     */
    inspectInstance(obj) {
      if (!get(obj, 'inspectable')) {
        return;
      }
      this.get('port').send('objectInspector:inspectByContainerLookup', { name: get(obj, 'fullName') });
    },
    sendContainerToConsole() {
      this.get('port').send('objectInspector:sendContainerToConsole');
    }
  }
});
