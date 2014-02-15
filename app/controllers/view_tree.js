export default Ember.ArrayController.extend({
  needs: ['application'],
  itemController: 'view-item',
  pinnedObjectId: null,
  inspectingViews: false,
  options: {
    components: false,
    allViews: false
  },

  optionsChanged: function() {
    this.port.send('view:setOptions', { options: this.get('options') });
  }.observes('options.components', 'options.allViews').on('init'),

  actions: {
    previewLayer: function(node) {
      if (node !== this.get('pinnedNode')) {
        this.get('port').send('view:previewLayer', { objectId: node.value.objectId });
      }
    },

    hidePreview: function(node) {
      this.get('port').send('view:hidePreview', { objectId: node.value.objectId });
    },

    toggleViewInspection: function() {
      this.get('port').send('view:inspectViews', { inspect: !this.get('inspectingViews') });
    },

    sendModelToConsole: function(viewId) {
      // do not use `sendObjectToConsole` because models don't have to be ember objects
      this.get('port').send('view:sendModelToConsole', { viewId: viewId });
    },

    sendObjectToConsole: function(objectId) {
      this.get('port').send('objectInspector:sendToConsole', { objectId: objectId });
    }
  }
});
