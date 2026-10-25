import EmberRouter from '@ember/routing/router';
import { isTesting } from '@embroider/macros';

/**
 * In the extensions, the UI loads from its pane folder,
 * so URLs are relative to that folder.
 *
 * In tests, the URL of the test page must not change,
 * and the test server serves the build from its root.
 * Production builds compile `isTesting()` to `false`.
 */
export default class Router extends EmberRouter {
  location = isTesting() ? 'none' : 'hash';
  rootURL = isTesting() ? '/' : '';
}

Router.map(function () {
  this.route('app-detected', { path: '/', resetNamespace: true }, function () {
    this.route('launch', { path: '/', resetNamespace: true });
    this.route('component-tree', { resetNamespace: true });
    this.route('route-tree', { resetNamespace: true });

    this.route('data', { resetNamespace: true }, function () {
      this.route('model-types', { resetNamespace: true }, function () {
        this.route(
          'model-type',
          { path: '/:type_id', resetNamespace: true },
          function () {
            this.route('records', { resetNamespace: true });
          },
        );
      });
    });

    this.route('promise-tree', { resetNamespace: true });

    this.route('info', { resetNamespace: true }, function () {
      this.route('info-index', { path: '/', resetNamespace: true });
      this.route('libraries', { resetNamespace: true });
      this.route('app-config', { resetNamespace: true });
      this.route('changelog', { resetNamespace: true });
    });

    this.route('render-tree', { resetNamespace: true });
    this.route('container-types', { resetNamespace: true }, function () {
      this.route('container-type', { path: '/:type_id', resetNamespace: true });
    });

    this.route('deprecations', { resetNamespace: true });
  });
});
