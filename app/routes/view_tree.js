var ViewTreeRoute = Ember.Route.extend({
  setupController: function() {
    this.get('port').on('view:viewTree', this, this.setViewTree);
    this.get('port').send('view:getTree');
  },

  deactivate: function() {
    this.get('port').off('view:viewTree', this, this.setViewTree);
  },

  setViewTree: function(options) {
    this.set('controller.model', { children: [ arrayizeTree(options.tree) ] });
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
