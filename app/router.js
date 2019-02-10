import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('app-detected', { path: '/', resetNamespace: true }, function() {
    this.route('launch', { path: '/', resetNamespace: true });
    this.route('component-tree', { resetNamespace: true });
    this.route('route-tree', { resetNamespace: true });

    this.route('data', { resetNamespace: true }, function() {
      this.route('model-types', { resetNamespace: true }, function() {
        this.route('model-type', { path: '/:type_id', resetNamespace: true }, function() {
          this.route('records', { resetNamespace: true });
        });
      });
    });

    this.route('promise-tree', { resetNamespace: true });

    this.route('info', { resetNamespace: true }, function() {
      this.route('info-index', { path: '/', resetNamespace: true });
      this.route('libraries', { path: '/libraries', resetNamespace: true });
      this.route('whats-new', { path: '/whats-new', resetNamespace: true });
    });

    this.route('render-tree', { resetNamespace: true });
    this.route('container-types', { resetNamespace: true }, function() {
      this.route('container-type', { path: '/:type_id', resetNamespace: true });
    });

    this.route('deprecations', { resetNamespace: true });
  });

});

export default Router;
