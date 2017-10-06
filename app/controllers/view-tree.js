import Ember from "ember";
const { computed, Controller, on, observer, inject: { controller } } = Ember;
const { alias } = computed;

export default Controller.extend({
  application: controller(),
  pinnedObjectId: null,
  inspectingViews: false,
  queryParams: ['components'],
  components: alias('options.components'),
  options: {
    components: false
  },

  searchText: "",

  viewNames: computed('searchText', 'filteredList.[]', function() {
    let list = this.get('filteredList');
    if (list.length) return list.map(v => v.value.name).join(" ");
    return `hello ${this.get('searchText')}`;
  }),

  filteredList: computed('model', 'searchText', function() {
    let searchText = this.get('searchText') || false;
    if (!searchText) return this.get('model');

    let filtered = this.get('model').filter(v => v.value.name.indexOf(searchText) > -1);
    return filtered;
  }),

  optionsChanged: on('init', observer('options.components', function() {
    this.port.send('view:setOptions', { options: this.get('options') });
  })),

  actions: {

    previewLayer({ value: { objectId, elementId, renderNodeId } }) {
      // We are passing all of objectId, elementId, and renderNodeId to support post-glimmer 1, post-glimmer 2, and root for
      // post-glimmer 2
      this.get('port').send('view:previewLayer', { objectId, renderNodeId, elementId });
    },

    hidePreview() {
      this.get('port').send('view:hidePreview');
    },

    toggleViewInspection() {
      this.get('port').send('view:inspectViews', { inspect: !this.get('inspectingViews') });
    },

    sendModelToConsole(value) {
      // do not use `sendObjectToConsole` because models don't have to be ember objects
      this.get('port').send('view:sendModelToConsole', value);
    },

    sendObjectToConsole(objectId) {
      this.get('port').send('objectInspector:sendToConsole', { objectId });
    },

    inspect(objectId) {
      if (objectId) {
        this.get('port').send('objectInspector:inspectById', { objectId });
      }
    },

    inspectElement({ objectId, elementId }) {
      this.get('port').send('view:inspectElement', { objectId, elementId });
    }
  }
});
