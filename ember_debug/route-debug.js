import DebugPort from './debug-port.js';
import { _backburner, later } from './utils/ember/runloop';
import { emberInspectorAPI } from './utils/ember-inspector-api.js';
import bound from './utils/bound-method';

/**
 * Route Debug - Refactored to use new Ember Inspector API
 *
 * Key improvements:
 * - No direct access to router internals (_routerMicrolib, recognizer)
 * - No version-specific logic (getRoute vs getHandler)
 * - No manual route tree building (100+ lines eliminated)
 * - No manual controller name resolution
 * - No manual factory existence checks
 * - No manual URL segment parsing
 * - Single API call replaces entire buildSubTree function
 */
export default class RouteDebug extends DebugPort {
  _cachedRouteTree = null;

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init();
    this.__currentURL = this.currentURL;
    this.__currentRouter = this.router;
    _backburner.on('end', bound(this, this.checkForUpdate));
  }

  checkForUpdate() {
    if (this.__currentURL !== this.currentURL) {
      this.sendCurrentRoute();
      this.__currentURL = this.currentURL;
    }
    if (this.__currentRouter !== this.router) {
      this._cachedRouteTree = null;
      this.__currentRouter = this.router;
    }
  }

  willDestroy() {
    _backburner.off('end', bound(this, this.checkForUpdate));
    super.willDestroy();
  }

  get owner() {
    return this.namespace?.owner;
  }

  get router() {
    if (
      emberInspectorAPI.owner.isDestroyed(this.owner) ||
      emberInspectorAPI.owner.isDestroying(this.owner)
    ) {
      return null;
    }
    return emberInspectorAPI.owner.lookup(this.owner, 'router:main');
  }

  get currentPath() {
    return emberInspectorAPI.router.getCurrentPath(this.owner);
  }

  get currentURL() {
    return emberInspectorAPI.router.getCurrentURL(this.owner);
  }

  static {
    this.prototype.portNamespace = 'route';
    this.prototype.messages = {
      getTree() {
        this.sendTree();
      },
      getCurrentRoute() {
        this.sendCurrentRoute();
      },
    };
  }

  sendCurrentRoute() {
    const { currentPath: name, currentURL: url } = this;
    later(() => {
      this.sendMessage('currentRoute', { name, url });
    }, 50);
  }

  /**
   * Get the complete route tree.
   *
   * BEFORE (150+ lines):
   * - Access router._routerMicrolib.recognizer.names
   * - Iterate all route names and handlers
   * - Version-specific handler retrieval (getRoute vs getHandler)
   * - Manual controller name resolution from route handlers
   * - Version-specific factory checks (factoryFor vs _lookupFactory)
   * - Manual URL segment parsing and formatting
   * - Handle unresolved promises
   * - Build hierarchical tree structure
   * - Complex buildSubTree function
   * - arrayizeChildren transformation
   *
   * AFTER (3 lines):
   * - Single API call
   * - All complexity handled by Ember
   * - Consistent structure across versions
   */
  get routeTree() {
    if (
      emberInspectorAPI.owner.isDestroyed(this.owner) ||
      emberInspectorAPI.owner.isDestroying(this.owner)
    ) {
      return null;
    }

    if (!this._cachedRouteTree && this.router) {
      // Use new high-level API - replaces 150+ lines of complex logic
      this._cachedRouteTree = emberInspectorAPI.router.buildRouteTree(
        this.owner,
      );
    }

    return this._cachedRouteTree;
  }

  sendTree() {
    let routeTree;
    let error;
    try {
      routeTree = this.routeTree;
    } catch (e) {
      error = e.message;
    }
    this.sendMessage('routeTree', { tree: routeTree, error });
  }
}
