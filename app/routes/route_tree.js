import TabRoute from 'routes/tab';

export default TabRoute.extend({
  setupController: function(controller, model) {
    this._super(controller, model);
    this.get('port').on('route:currentRoute', this, this.setCurrentRoute);
    this.get('port').send('route:getCurrentRoute');
    this.get('port').on('route:routeTree', this, this.setTree);
    this.get('port').send('route:getTree');
  },

  deactivate: function() {
    this.get('port').off('route:currentRoute');
    this.get('port').off('route:routeTree', this, this.setTree);
  },

  setCurrentRoute: function(message) {
    this.get('controller').set('currentRoute', message.name);
  },

  setTree: function(options) {
    var routeArray = topSort(options.tree);
    this.set('controller.model', routeArray);
  },

  actions: {
    inspectRoute: function(name) {
      this.get('port').send('objectInspector:inspectRoute', { name: name } );
    },

    inspectController: function(controller) {
      if (!controller.exists) {
        return;
      }
      this.get('port').send('objectInspector:inspectController', { name: controller.name } );
    },

    sendControllerToConsole: function(controllerName) {
      this.get('port').send('objectInspector:sendControllerToConsole', { name: controllerName });
    },

    sendRouteHandlerToConsole: function(routeName) {
      this.get('port').send('objectInspector:sendRouteHandlerToConsole', { name: routeName });
    }
  }
});


function topSort(tree, list) {
  list = list || [];
  var view = $.extend({}, tree);
  view.parentCount = view.parentCount || 0;
  delete view.children;
  list.push(view);
  tree.children = tree.children || [];
  tree.children.forEach(function(child) {
    child.parentCount = view.parentCount + 1;
    topSort(child, list);
  });
  return list;
}
