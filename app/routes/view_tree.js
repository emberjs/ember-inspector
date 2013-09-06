var ViewTreeRoute = Ember.Route.extend({
  setupController: function() {
    this.get('port').on('view:viewTree', this, this.setViewTree);
    this.get('port').on('view:stopInspecting', this, this.stopInspecting);
    this.get('port').on('view:startInspecting', this, this.startInspecting);
    this.get('port').send('view:getTree');
  },

  deactivate: function() {
    this.get('port').off('view:viewTree', this, this.setViewTree);
    this.get('port').off('view:stopInspecting', this, this.stopInspecting);
    this.get('port').off('view:startInspecting', this, this.startInspecting);
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

  actions: {
    inspect: function(objectId) {
      if (objectId) {
        this.get('port').send('objectInspector:inspectById', { objectId: objectId });
      }
    }
  }

});


function arrayizeTree(tree) {
  Ember.NativeArray.apply(tree.children);
  tree.children.forEach(arrayizeTree);
  return tree;
}


export default ViewTreeRoute;
