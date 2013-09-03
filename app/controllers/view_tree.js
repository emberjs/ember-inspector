var ViewTreeController = Ember.ObjectController.extend({
  pinnedNode: null,

  actions: {
    previewLayer: function(node) {
      if (node !== this.get('pinnedNode')) {
        this.get('port').send('view:previewLayer', { objectId: node.value.objectId });
      }
    },
    hidePreview: function(node) {
      this.get('port').send('view:hidePreview', { objectId: node.value.objectId });
    }
  }
});

export default ViewTreeController;
