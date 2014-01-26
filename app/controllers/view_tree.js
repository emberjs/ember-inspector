var ViewTreeController = Ember.ArrayController.extend({
  needs: ['application'],
  itemController: 'viewItem',
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
    }
  }
});

export default ViewTreeController;
