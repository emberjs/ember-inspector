var ViewTreeController = Ember.Controller.extend({
  showLayer: function(node) {
    this.set('pinnedNode', null);
    this.get('port').send('showLayer', node.value.objectId);
  },

  hideLayer: function(node) {
    if (!this.get('pinnedNode')) {
      this.get('port').send('hideLayer', node.value.objectId);
    }
  },

  pinLayer: function(node) {
    this.set('pinnedNode', node);
  }
});

export = ViewTreeController;
