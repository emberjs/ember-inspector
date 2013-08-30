var ViewTreeController = Ember.Controller.extend({
  pinnedNode: null,

  hideLayer: function(node) {
    this.get('port').send('view:hideLayer', { objectId: node.value.objectId });
  },

  actions: {
    showLayer: function(node) {
      this.set('pinnedNode', null);
      this.get('port').send('view:showLayer', { objectId: node.value.objectId });
      this.set('pinnedNode', node);
    },
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
