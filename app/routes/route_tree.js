var RouteTreeRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    this._super(controller, model);
    this.get('port').on('route:routeTree', this, this.setTree);
    this.get('port').send('route:getTree');
  },

  deactivate: function() {
    this.get('port').off('route:routeTree', this, this.setViewTree);
  },

  setTree: function(options) {
    this.set('controller.node', { children: [ arrayizeTree(options.tree) ] });
  },

  events: {
    inspectRoute: function(route) {
      this.get('port').send('objectInspector:inspectRoute', { name: route.value.name } );
    }
  }
});


function arrayizeTree(tree) {
  if(tree.children) {
    Ember.NativeArray.apply(tree.children);
    tree.children.forEach(arrayizeTree);
  }
  return tree;

}


export = RouteTreeRoute;
