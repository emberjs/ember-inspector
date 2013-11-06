var Router = Ember.Router.extend({
  location: 'none'
});

Router.map(function() {
  this.route('view_tree', { path: '/' });
  this.route('route_tree');

  this.resource('data', function() {
    this.resource('model_types', function() {
      this.resource('model_type', { path: '/:type_id'}, function() {
        this.resource('records');
      });
    });
  });

  this.route('promise_tree');

});

export default Router;
