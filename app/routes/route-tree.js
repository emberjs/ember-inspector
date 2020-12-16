import { assign } from '@ember/polyfills';
import TabRoute from 'ember-inspector/routes/tab';

export default TabRoute.extend({
  setupController() {
    this.port.on('route:currentRoute', this, this.setCurrentRoute);
    this.port.send('route:getCurrentRoute');
    this.port.on('route:routeTree', this, this.setTree);
    this.port.send('route:getTree');
  },

  deactivate() {
    this.port.off('route:currentRoute', this, this.setCurrentRoute);
    this.port.off('route:routeTree', this, this.setTree);
  },

  setCurrentRoute(message) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    this.controller.set('currentRoute', message);
  },

  setTree(options) {
    let routeArray = topSort(options.tree);
    this.set('controller.model', routeArray);
  },
});

function topSort(tree, list) {
  list = list || [];
  let route = assign({}, tree);
  delete route.children;
  // Firt node in the tree doesn't have a value
  if (route.value) {
    route.parentCount = route.parentCount || 0;
    list.push(route);
  }
  tree.children = tree.children || [];
  tree.children.forEach((child) => {
    child.parentCount = route.parentCount + 1;
    topSort(child, list);
  });
  return list;
}
