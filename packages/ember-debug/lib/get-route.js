/* eslint-disable ember/no-private-routing-service */
import { compareVersion } from '../utils/version.js';
import { VERSION } from './ember.js';

/**
 * @param {*} router The `router:main` instance
 * @param {string} name The name of the route
 * @return {*} The route, or a promise for a route that is not loaded
 */
export default function getRoute(router, name) {
  const routerLib = router._routerMicrolib || router.router;

  // 3.9.0 removed intimate APIs from router
  // https://github.com/emberjs/ember.js/pull/17843
  // https://deprecations.emberjs.com/v3.x/#toc_remove-handler-infos
  if (compareVersion(VERSION, '3.9.0') === -1) {
    return routerLib.getHandler(name);
  }

  const route = routerLib.getRoute(name);

  // Ember 7.5 returns the route manager and its state, not the route.
  return route?.bucket?.route ?? route;
}
