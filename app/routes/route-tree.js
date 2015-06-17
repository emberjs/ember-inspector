import Ember from "ember";
import TabRoute from "ember-inspector/routes/tab";
const $ = Ember.$;

export default TabRoute.extend({
  setupController() {
    this.get('port').on('route:currentRoute', this, this.setCurrentRoute);
    this.get('port').send('route:getCurrentRoute');
    this.get('port').on('route:routeTree', this, this.setTree);
    this.get('port').send('route:getTree');
  },

  deactivate() {
    this.get('port').off('route:currentRoute');
    this.get('port').off('route:routeTree', this, this.setTree);
  },

  setCurrentRoute(message) {
    this.get('controller').set('currentRoute', message.name);
  },

  setTree(options) {
    const routeArray = topSort(options.tree);
    this.set('controller.model', routeArray);
  },

  actions: {
    inspectRoute(name) {
      this.get('port').send('objectInspector:inspectRoute', { name: name } );
    },

    inspectController(controller) {
      if (!controller.exists) {
        return;
      }
      this.get('port').send('objectInspector:inspectController', { name: controller.name } );
    },

    sendControllerToConsole(controllerName) {
      this.get('port').send('objectInspector:sendControllerToConsole', { name: controllerName });
    },

    sendRouteHandlerToConsole(routeName) {
      this.get('port').send('objectInspector:sendRouteHandlerToConsole', { name: routeName });
    }
  }
});


function topSort(tree, list) {
  list = list || [];
  let route = $.extend({}, tree);
  delete route.children;
  // Firt node in the tree doesn't have a value
  if (route.value) {
    route.parentCount = route.parentCount || 0;
    list.push(route);
  }
  tree.children = tree.children || [];
  tree.children.forEach(child => {
    child.parentCount = route.parentCount + 1;
    topSort(child, list);
  });
  return list;
}
