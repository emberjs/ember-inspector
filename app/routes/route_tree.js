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
    this.set('controller.model', { children: [ arrayizeTree(options.tree) ] });
  },

  model: function() {
    // To generate an object controller
    return {};
  },

  events: {
    inspectRoute: function(name) {
      this.get('port').send('objectInspector:inspectRoute', { name: name } );
    },

    inspectController: function(controller) {
      if (!controller.exists) {
        return;
      }
      this.get('port').send('objectInspector:inspectController', { name: controller.name } );
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
