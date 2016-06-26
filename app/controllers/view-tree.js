import Ember from "ember";
const { computed, Controller, on, observer, inject } = Ember;
const { alias } = computed;

export default Controller.extend({
  application: inject.controller(),
  pinnedObjectId: null,
  inspectingViews: false,
  queryParams: ['components', 'allViews'],
  components: alias('options.components'),
  allViews: alias('options.allViews'),
  options: {
    components: false,
    allViews: false
  },

  optionsChanged: on('init', observer('options.components', 'options.allViews', function() {
    this.port.send('view:setOptions', { options: this.get('options') });
  })),

  actions: {
    previewLayer(node) {
      // We are passing both objectId and renderNodeId to support both pre-glimmer and post-glimmer
      this.get('port').send('view:previewLayer', { objectId: node.value.objectId, renderNodeId: node.value.renderNodeId });
    },

    hidePreview() {
      this.get('port').send('view:hidePreview');
    },

    toggleViewInspection() {
      this.get('port').send('view:inspectViews', { inspect: !this.get('inspectingViews') });
    },

    sendModelToConsole(value) {
      // do not use `sendObjectToConsole` because models don't have to be ember objects
      this.get('port').send('view:sendModelToConsole', { viewId: value.objectId, renderNodeId: value.renderNodeId });
    },

    sendObjectToConsole(objectId) {
      this.get('port').send('objectInspector:sendToConsole', { objectId: objectId });
    }
  }
});
