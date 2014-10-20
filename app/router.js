var Router = Ember.Router.extend({
  location: 'none'
});

Router.map(function() {
  this.resource('view-tree', { path: '/' });
  this.resource('route-tree');

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

  this.resource('info');
  this.resource('render-tree');
  this.resource('container-types', function() {
    this.resource('container-type', { path: '/:type_id' });
  });
});

export default Router;
