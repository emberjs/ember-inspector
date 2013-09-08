var ViewTreeRoute = Ember.Route.extend({
  setupController: function() {
    this.get('port').on('view:viewTree', this, this.setViewTree);
    this.get('port').on('view:stopInspecting', this, this.stopInspecting);
    this.get('port').on('view:startInspecting', this, this.startInspecting);
    this.get('port').on('view:pinView', this, this.pinView);
    this.get('port').on('view:unpinView', this, this.unpinView);
    this.get('port').send('view:getTree');
  },

  deactivate: function() {
    this.get('port').off('view:viewTree', this, this.setViewTree);
    this.get('port').off('view:stopInspecting', this, this.stopInspecting);
    this.get('port').off('view:startInspecting', this, this.startInspecting);
    this.get('port').off('view:pinView', this, this.pinView);
    this.get('port').off('view:unpinView', this, this.unpinView);
  },

  setViewTree: function(options) {
    this.set('controller.model', { children: [ arrayizeTree(options.tree) ] });
  },

  startInspecting: function() {
    this.set('controller.inspectingViews', true);
  },

  stopInspecting: function() {
    this.set('controller.inspectingViews', false);
  },

  pinView: function(message) {
    this.set('controller.pinnedObjectId', message.objectId);
  },

  unpinView: function() {
    this.set('controller.pinnedObjectId', null);
  },

  actions: {
    inspect: function(objectId) {
      if (objectId) {
        this.get('port').send('objectInspector:inspectById', { objectId: objectId });
      }
    },
    inspectElement: function(objectId) {
      this.get('port').send('view:inspectElement', { objectId: objectId });
    }
  }

});


function arrayizeTree(tree) {
  Ember.NativeArray.apply(tree.children);
  tree.children.forEach(arrayizeTree);
  return tree;
}


export default ViewTreeRoute;
