var ViewTreeController = Ember.Controller.extend({
  pinnedNode: null,

  showLayer: function(node) {
    this.set('pinnedNode', null);
    this.get('port').send('showLayer', { objectId: node.value.objectId });
    this.set('pinnedNode', node);
  },

  hideLayer: function(node) {
    this.get('port').send('hideLayer', { objectId: node.value.objectId });
  },

  previewLayer: function(node) {
    if (node !== this.get('pinnedNode')) {
      this.get('port').send('previewLayer', { objectId: node.value.objectId });
    }
  },

  hidePreview: function(node) {
    this.get('port').send('hidePreview', { objectId: node.value.objectId });
  }
});

export = ViewTreeController;
