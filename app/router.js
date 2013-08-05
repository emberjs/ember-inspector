var Router = Ember.Router.extend({
  location: 'none'
});

Router.map(function() {
  this.route('view_tree', { path: '/' });
  this.route('route_tree');
});

export default Router;
