import { observer, get, computed } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import searchMatch from 'ember-inspector/utils/search-match';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  application: controller(),
  pinnedObjectId: null,
  inspectingViews: false,
  queryParams: ['components'],
  components: alias('options.components'),
  options: {
    components: false
  },

  /**
   * Bound to the search field to filter the component list.
   *
   * @property searchValue
   * @type {String}
   * @default ''
   */
  searchValue: '',

  /**
   * The filtered view list.
   *
   * @property filteredList
   * @type {Array<Object>}
   */
  filteredList: computed('model.[]', 'searchValue', function() {
    return get(this, 'model')
      .filter((item) => searchMatch(get(item, 'value.name'), this.get('searchValue')));
  }),

  optionsChanged: observer('options.components', function() {
    this.port.send('view:setOptions', { options: this.get('options') });
  }),

  actions: {
    hidePreview() {
      this.get('port').send('view:hidePreview');
    },

    inspect(objectId) {
      if (objectId) {
        this.get('port').send('objectInspector:inspectById', { objectId });
      }
    },

    inspectElement({ objectId, elementId }) {
      this.get('port').send('view:inspectElement', { objectId, elementId });
    },

    previewLayer({ value: { objectId, elementId, renderNodeId } }) {
      // We are passing all of objectId, elementId, and renderNodeId to support post-glimmer 1, post-glimmer 2, and root for
      // post-glimmer 2
      this.get('port').send('view:previewLayer', { objectId, renderNodeId, elementId });
    },

    sendModelToConsole(value) {
      // do not use `sendObjectToConsole` because models don't have to be ember objects
      this.get('port').send('view:sendModelToConsole', value);
    },

    sendObjectToConsole(objectId) {
      this.get('port').send('objectInspector:sendToConsole', { objectId });
    },

    toggleViewInspection() {
      this.get('port').send('view:inspectViews', { inspect: !this.get('inspectingViews') });
    }
  }
});
