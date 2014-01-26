var Router = Ember.Router.extend({
  location: 'none'
});

Router.map(function() {
  this.route('view-tree', { path: '/' });
  this.route('route-tree');

  this.resource('data', function() {
    this.resource('model-types', function() {
      this.resource('model-type', { path: '/:type_id'}, function() {
        this.resource('records');
      });
    });
  });

  this.resource('promises', function() {
    this.resource('promise-tree');
  });
});

export default Router;
