var Router = Ember.Router.extend();
Router.map(function() {
  this.route('view_tree', { path: '/' });
});

export = Router;
