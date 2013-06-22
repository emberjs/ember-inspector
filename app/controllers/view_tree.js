var ViewTreeController = Ember.Controller.extend({
  showLayer: function(node) {
    this.set('pinnedNode', null);
    window.showLayer(node.value.objectId);
  },

  hideLayer: function(node) {
    if (!this.get('pinnedNode')) {
      window.hideLayer(node.value.objectId);
    }
  },

  pinLayer: function(node) {
    this.set('pinnedNode', node);
  }
});

export = ViewTreeController;
