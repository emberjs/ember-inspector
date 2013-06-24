var ViewTreeController = Ember.Controller.extend({
  
  showLayer: function(node) {
    this.set('pinnedNode', null);
    this.get('port').send('showLayer', { objectId: node.value.objectId });
  },

  hideLayer: function(node) {
    if (!this.get('pinnedNode')) {
      this.get('port').send('hideLayer', { objectId: node.value.objectId });
    }
  },

  previewLayer: function(node) {
    this.get('port').send('previewLayer', { objectId: node.value.objectId });
  },

  hidePreview: function(node) {
    this.get('port').send('hidePreview', { objectId: node.value.objectId });
  },

  pinLayer: function(node) {
    this.set('pinnedNode', node);
  }
});

export = ViewTreeController;
