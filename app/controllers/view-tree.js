import Ember from "ember";
const { computed, Controller } = Ember;
const { alias } = computed;

export default Controller.extend({
  needs: ['application'],
  pinnedObjectId: null,
  inspectingViews: false,
  queryParams: ['components', 'allViews'],
  components: alias('options.components'),
  allViews: alias('options.allViews'),
  options: {
    components: false,
    allViews: false
  },

  optionsChanged: function() {
    this.port.send('view:setOptions', { options: this.get('options') });
  }.observes('options.components', 'options.allViews').on('init'),

  actions: {
    previewLayer: function(node) {
      // We are passing both objectId and renderNodeId to support both pre-glimmer and post-glimmer
      this.get('port').send('view:previewLayer', { objectId: node.value.objectId, renderNodeId: node.value.renderNodeId });
    },

    hidePreview: function() {
      this.get('port').send('view:hidePreview');
    },

    toggleViewInspection: function() {
      this.get('port').send('view:inspectViews', { inspect: !this.get('inspectingViews') });
    },

    sendModelToConsole: function(value) {
      // do not use `sendObjectToConsole` because models don't have to be ember objects
      this.get('port').send('view:sendModelToConsole', { viewId: value.objectId, renderNodeId: value.renderNodeId });
    },

    sendObjectToConsole: function(objectId) {
      this.get('port').send('objectInspector:sendToConsole', { objectId: objectId });
    }
  }
});
