/**
 * Ember Inspector API - Stub Implementation
 *
 * This file demonstrates what the proposed public API from ember-source
 * would look like when accessed via appLoader.loadCompatInspector()
 *
 * In production, this would be provided by ember-source, not the inspector.
 * The inspector would access it via:
 *
 *   const api = globalThis.emberInspectorApps[0].loadCompatInspector();
 *
 * This stub shows the interface that ember-source should implement.
 */

// Import the legacy implementation
import * as legacyEmber from './ember-legacy';

/**
 * Get or create the Ember Inspector API
 * This function handles both the new API (via appLoader) and legacy fallback
 */
async function getEmberInspectorAPI() {
  // Check if we're running in a Vite/Embroider environment with the new API
  if (globalThis.emberInspectorApps && globalThis.emberInspectorApps[0]) {
    const appLoader = globalThis.emberInspectorApps[0];

    // Check if loadCompatInspector is available
    if (typeof appLoader.loadCompatInspector === 'function') {
      try {
        // Note: This returns a promise in the real implementation
        // For now, we assume it's been loaded synchronously or we use the fallback
        return appLoader.loadCompatInspector();
      } catch (error) {
        console.warn('Failed to load inspector API from appLoader:', error);
      }
    }
  }
  // Create a compatibility API structure from the legacy exports
  return {
    debug: {
      captureRenderTree: legacyEmber.captureRenderTree,
      inspect: legacyEmber.inspect,
      registerDeprecationHandler: legacyEmber.Debug?.registerDeprecationHandler,
    },
    environment: {
      getEnv: legacyEmber.getEnv,
      VERSION: legacyEmber.VERSION,
    },
    instrumentation: {
      subscribe: legacyEmber.subscribe,
      GlimmerRuntime: legacyEmber.GlimmerRuntime,
      GlimmerManager: legacyEmber.GlimmerManager,
      GlimmerReference: legacyEmber.GlimmerReference,
      GlimmerUtil: legacyEmber.GlimmerUtil,
      EmberDestroyable: legacyEmber.EmberDestroyable,
    },
    objectInternals: {
      cacheFor: legacyEmber.cacheFor,
      guidFor: legacyEmber.guidFor,
      meta: legacyEmber.meta,
      get: legacyEmber.get,
      set: legacyEmber.set,
    },
    owner: {

      /**
       * Get own mixins for an object
       * Filters out anonymous mixins that are directly in a `class.extend`
       * @param {Object} object - The object to get mixins for
       * @returns {Set} Set of own mixins
       */
      ownMixins: (object) => {
        // TODO: We need to expose an API for getting _just_ the own mixins directly
        const meta = legacyEmber.meta(object);
        const parentMeta = meta.parent;
        const mixins = new Set();

        // Filter out anonymous mixins that are directly in a `class.extend`
        const baseMixins =
          object.constructor &&
          object.constructor.PrototypeMixin &&
          object.constructor.PrototypeMixin.mixins;

        meta.forEachMixins((m) => {
          // Find mixins that:
          // - Are not in the parent classes
          // - Are not primitive (has mixins, doesn't have properties)
          // - Don't include any of the base mixins from a class extend
          if (
            (!parentMeta || !parentMeta.hasMixin(m)) &&
            !m.properties &&
            m.mixins &&
            (!baseMixins || !m.mixins.some((m) => baseMixins.includes(m)))
          ) {
            mixins.add(m);
          }
        });

        return mixins;
      },

      getOwner: legacyEmber.getOwner,

      lookup: (owner, fullName) => {
        return owner?.lookup(fullName);
      },

      isDestroyed: (owner) => {
        return owner?.isDestroyed || false;
      },

      isDestroying: (owner) => {
        return owner?.isDestroying || false;
      },

      getApplications: () => {
        // Get all Application instances from Namespace.NAMESPACES
        if (!legacyEmber.Namespace || !legacyEmber.Application) {
          return [];
        }
        return legacyEmber.Namespace.NAMESPACES.filter(
          (ns) => ns instanceof legacyEmber.Application,
        );
      },

      getOwnerFromApplication: (app) => {
        // Get the owner/instance from an application
        if (!app) return null;
        return (
          app.__deprecatedInstance__ || app._applicationInstances?.[0] || null
        );
      },

      getApplication: () => {
        // Get the first application
        if (!legacyEmber.Namespace || !legacyEmber.Application) {
          return null;
        }
        const apps = legacyEmber.Namespace.NAMESPACES.filter(
          (ns) => ns instanceof legacyEmber.Application,
        );
        return apps[0] || null;
      },

      registerInitializer: (config) => {
        // Register an application initializer
        if (legacyEmber.Application) {
          legacyEmber.Application.initializer(config);
        }
      },

      isApplicationReady: (app) => {
        // Check if application is ready (all initializers have run)
        if (!app) return false;
        return app._readinessDeferrals === 0;
      },

      waitForApplicationBoot: (app) => {
        // Wait for application to boot
        if (!app) return null;
        return app._bootPromise || null;
      },

      resolveRegistration: (owner, fullName) => {
        // Resolve a registration from the container
        if (!owner) return null;

        // Try modern API first
        if (owner.resolveRegistration) {
          return owner.resolveRegistration(fullName);
        }

        // Fallback to factoryFor
        const factory = owner.factoryFor?.(fullName);
        return factory?.class || null;
      },

      // Higher-level API methods that wrap lookup/resolveRegistration
      hasRegistration: (owner, fullName) => {
        if (!owner) return false;

        // Try factoryFor first (modern API)
        if (owner.factoryFor) {
          return !!owner.factoryFor(fullName);
        }

        // Fallback to resolveRegistration
        if (owner.resolveRegistration) {
          return !!owner.resolveRegistration(fullName);
        }

        return false;
      },

      getDataAdapter: (owner) => {
        if (!owner) return null;

        // Check if data adapter is registered before attempting lookup
        const hasAdapter = owner.factoryFor?.('data-adapter:main') ||
                          owner.resolveRegistration?.('data-adapter:main');

        if (!hasAdapter) return null;

        return owner.lookup('data-adapter:main');
      },

      getRouter: (owner) => {
        if (!owner) return null;
        return owner.lookup('router:main');
      },

      getController: (owner, name) => {
        if (!owner || !name) return null;
        return owner.lookup(`controller:${name}`);
      },

      getRoute: (owner, name) => {
        if (!owner || !name) return null;
        return owner.lookup(`route:${name}`);
      },

      getInstance: (owner, fullName) => {
        if (!owner || !fullName) return null;
        return owner.lookup(fullName);
      },
    },
    router: {
      getCurrentPath: (owner) => {
        // eslint-disable-next-line ember/no-private-routing-service
        const router = owner?.lookup('router:main');
        return router?.currentPath || router?.currentRouteName || null;
      },
      getCurrentURL: (owner) => {
        // eslint-disable-next-line ember/no-private-routing-service
        const router = owner?.lookup('router:main');
        return router?.currentURL || router?.get?.('currentURL') || null;
      },
      /**
       * Get all container instances grouped by type
       * Replaces direct access to owner.__container__.cache
       * @param {Object} owner - The owner/container
       * @param {Object} options - Filtering options
       * @param {Array<string>} options.excludeTypes - Types to exclude
       * @param {boolean} options.includePrivate - Whether to include private types (starting with -)
       * @returns {Object} Instances grouped by type: { type: [{ fullName, instance }] }
       */
      getContainerInstances: (owner, options = {}) => {
        if (!owner || !owner.__container__) return {};

        const { excludeTypes = [], includePrivate = false } = options;
        const instancesByType = {};
        let cache = owner.__container__.cache;

        // Detect if InheritingDict (from Ember < 1.8)
        if (
          typeof cache.dict !== 'undefined' &&
          typeof cache.eachLocal !== 'undefined'
        ) {
          cache = cache.dict;
        }

        for (const key in cache) {
          if (!Object.prototype.hasOwnProperty.call(cache, key)) {
            continue;
          }

          const type = key.split(':').shift();

          // Filter out private types (starting with -)
          if (!includePrivate && type[0] === '-') {
            continue;
          }

          // Filter out excluded types
          if (excludeTypes.includes(type)) {
            continue;
          }

          if (!instancesByType[type]) {
            instancesByType[type] = [];
          }

          instancesByType[type].push({
            fullName: key,
            instance: cache[key],
          });
        }

        return instancesByType;
      },
      buildRouteTree: (owner) => {
        // Simplified implementation - builds route tree from router internals
        // eslint-disable-next-line ember/no-private-routing-service
        const router = owner?.lookup('router:main');
        if (!router) return { children: [] };

        // eslint-disable-next-line ember/no-private-routing-service
        const routerLib = router._routerMicrolib || router.router;
        if (!routerLib?.recognizer?.names) return { children: [] };

        const routeNames = routerLib.recognizer.names;
        const routeTree = {};

        for (let routeName in routeNames) {
          if (!Object.prototype.hasOwnProperty.call(routeNames, routeName)) {
            continue;
          }
          const route = routeNames[routeName];
          buildSubTree(owner, routeTree, route, router);
        }

        return arrayizeChildren({ children: routeTree });
      },
      getRouteHandler: (owner, routeName) => {
        console.log('[getRouteHandler] Called with:', { owner, routeName });

        if (!owner || !routeName) {
          console.log('[getRouteHandler] Missing owner or routeName');
          return null;
        }

        // eslint-disable-next-line ember/no-private-routing-service
        const router = owner.lookup('router:main');
        console.log('[getRouteHandler] Router:', router);
        if (!router) {
          console.log('[getRouteHandler] No router found');
          return null;
        }

        // eslint-disable-next-line ember/no-private-routing-service
        const routerLib = router._routerMicrolib || router.router;
        console.log('[getRouteHandler] RouterLib:', routerLib);
        console.log('[getRouteHandler] Has getRoute:', !!routerLib?.getRoute);
        console.log(
          '[getRouteHandler] Has getHandler:',
          !!routerLib?.getHandler,
        );

        if (!routerLib) {
          console.log('[getRouteHandler] No routerLib found');
          return null;
        }

        // Use router's internal methods to get the route handler
        // getRoute is available in Ember >= 3.9.0
        // getHandler is for Ember < 3.9.0
        // Note: These can return promises for unresolved routes
        let result;
        if (routerLib.getRoute) {
          result = routerLib.getRoute(routeName);
          console.log('[getRouteHandler] getRoute result:', result);
        } else if (routerLib.getHandler) {
          result = routerLib.getHandler(routeName);
          console.log('[getRouteHandler] getHandler result:', result);
        }

        console.log('[getRouteHandler] Final result:', result);
        return result || null;
      },
    },
    renderTree: {
      getDebugRenderTree: (owner) => {
        // Try to get debug render tree from renderer or render service
        const renderer = owner?.lookup('renderer:-dom');
        if (renderer?._debugRenderTree) {
          return renderer._debugRenderTree;
        }

        const renderService = owner?.lookup('service:-render');
        if (renderService?._debugRenderTree) {
          return renderService._debugRenderTree;
        }

        return null;
      },
    },
    libraries: {
      RSVP: legacyEmber.RSVP,
    },
    typeChecking: {
      // Use instanceof checks with the actual class references
      isEmberObject: (obj) =>
        legacyEmber.EmberObject &&
        typeof legacyEmber.EmberObject === 'function' &&
        obj instanceof legacyEmber.EmberObject,
      isComponent: (obj) =>
        legacyEmber.Component &&
        typeof legacyEmber.Component === 'function' &&
        obj instanceof legacyEmber.Component,
      isGlimmerComponent: (obj) =>
        legacyEmber.GlimmerComponent &&
        typeof legacyEmber.GlimmerComponent === 'function' &&
        obj instanceof legacyEmber.GlimmerComponent,
      isService: (obj) =>
        legacyEmber.Service &&
        typeof legacyEmber.Service === 'function' &&
        obj instanceof legacyEmber.Service,
      isObjectProxy: (obj) =>
        legacyEmber.ObjectProxy &&
        typeof legacyEmber.ObjectProxy === 'function' &&
        obj instanceof legacyEmber.ObjectProxy,
      isArrayProxy: (obj) =>
        legacyEmber.ArrayProxy &&
        typeof legacyEmber.ArrayProxy === 'function' &&
        obj instanceof legacyEmber.ArrayProxy,
      isCoreObject: (obj) =>
        legacyEmber.CoreObject &&
        typeof legacyEmber.CoreObject === 'function' &&
        obj instanceof legacyEmber.CoreObject,
      isApplication: (obj) =>
        legacyEmber.Application &&
        typeof legacyEmber.Application === 'function' &&
        obj instanceof legacyEmber.Application,
      isNamespace: (obj) =>
        legacyEmber.Namespace &&
        typeof legacyEmber.Namespace === 'function' &&
        obj instanceof legacyEmber.Namespace,
      // Mixin checks - use duck typing since mixins can't use instanceof
      hasObservable: (obj) =>
        legacyEmber.Observable &&
        ((typeof legacyEmber.Observable === 'function' &&
          obj instanceof legacyEmber.Observable) ||
          (obj && typeof obj.addObserver === 'function')),
      hasEvented: (obj) =>
        legacyEmber.Evented &&
        ((typeof legacyEmber.Evented === 'function' &&
          obj instanceof legacyEmber.Evented) ||
          (obj && typeof obj.on === 'function')),
      hasPromiseProxyMixin: (obj) =>
        legacyEmber.PromiseProxyMixin &&
        ((typeof legacyEmber.PromiseProxyMixin === 'function' &&
          obj instanceof legacyEmber.PromiseProxyMixin) ||
          (obj && typeof obj.then === 'function' && obj.content !== undefined)),
      hasControllerMixin: (obj) =>
        legacyEmber.ControllerMixin &&
        ((typeof legacyEmber.ControllerMixin === 'function' &&
          obj instanceof legacyEmber.ControllerMixin) ||
          (obj && obj.target !== undefined && obj.model !== undefined)),
      isMutableArray: (obj) =>
        legacyEmber.MutableArray &&
        ((typeof legacyEmber.MutableArray === 'function' &&
          obj instanceof legacyEmber.MutableArray) ||
          Array.isArray(obj) ||
          (obj && typeof obj.pushObject === 'function')),
      isMutableEnumerable: (obj) =>
        legacyEmber.MutableEnumerable &&
        ((typeof legacyEmber.MutableEnumerable === 'function' &&
          obj instanceof legacyEmber.MutableEnumerable) ||
          (obj && typeof obj.forEach === 'function')),
      isNativeArray: (obj) =>
        legacyEmber.NativeArray &&
        ((typeof legacyEmber.NativeArray === 'function' &&
          obj instanceof legacyEmber.NativeArray) ||
          Array.isArray(obj)),
    },
    naming: {
      getClassName: (classOrMixin) => {
        // Return Ember-style names for known classes and mixins
        if (!classOrMixin) return null;

        // Check against known Ember classes and mixins
        if (classOrMixin === legacyEmber.Evented) return 'Evented Mixin';
        if (classOrMixin === legacyEmber.PromiseProxyMixin)
          return 'PromiseProxy Mixin';
        if (classOrMixin === legacyEmber.MutableArray)
          return 'MutableArray Mixin';
        if (classOrMixin === legacyEmber.MutableEnumerable)
          return 'MutableEnumerable Mixin';
        if (classOrMixin === legacyEmber.NativeArray)
          return 'NativeArray Mixin';
        if (classOrMixin === legacyEmber.Observable) return 'Observable Mixin';
        if (classOrMixin === legacyEmber.ControllerMixin)
          return 'Controller Mixin';
        if (classOrMixin === legacyEmber.CoreObject) return 'CoreObject';
        if (classOrMixin === legacyEmber.EmberObject) return 'EmberObject';
        if (classOrMixin === legacyEmber.Component) return 'Component';
        if (classOrMixin === legacyEmber.ActionHandler)
          return 'ActionHandler Mixin';

        // Check InternalsViews if available
        if (legacyEmber.InternalsViews) {
          const Views = legacyEmber.InternalsViews;
          if (classOrMixin === Views.ViewStateSupport)
            return 'ViewStateSupport Mixin';
          if (classOrMixin === Views.ViewMixin) return 'View Mixin';
          if (classOrMixin === Views.ActionSupport)
            return 'ActionSupport Mixin';
          if (classOrMixin === Views.ClassNamesSupport)
            return 'ClassNamesSupport Mixin';
          if (classOrMixin === Views.ChildViewsSupport)
            return 'ChildViewsSupport Mixin';
          if (classOrMixin === Views.CoreView) return 'CoreView';
        }

        // Check InternalsRuntime for TargetActionSupport (pre-3.27.0)
        if (legacyEmber.InternalsRuntime?.TargetActionSupport) {
          if (
            classOrMixin === legacyEmber.InternalsRuntime.TargetActionSupport
          ) {
            return 'TargetActionSupport Mixin';
          }
        }

        // Fallback to constructor name
        return classOrMixin?.constructor?.name || classOrMixin?.name || null;
      },
    },
    tracking: {
      createPropertyTracker: () => ({}),
      hasPropertyChanged: () => false,
      getPropertyDependencies: () => [],
      getChangedDependencies: () => [],
      isTrackedProperty: () => false,
    },
    computed: {
      isComputed: (obj, key) => {
        // Check if the property descriptor is a computed property
        const descriptor = obj?.[key];
        if (!descriptor) return false;

        // Check for isDescriptor flag (Ember computed properties)
        if (descriptor.isDescriptor) return true;

        // Check if it's an instance of ComputedProperty
        if (
          legacyEmber.ComputedProperty &&
          descriptor instanceof legacyEmber.ComputedProperty
        ) {
          return true;
        }

        return false;
      },
      getComputedPropertyDescriptor: (obj, key) => obj?.[key],
      getDependentKeys: () => [],
      isMandatorySetter: (descriptor) => {
        // Check if a descriptor is Ember's mandatory setter
        // Mandatory setters have a specific error message in their setter
        if (!descriptor?.set) return false;
        const setterCode = descriptor.set.toString();
        return setterCode.includes('You attempted to update');
      },
      getComputedMetadata: (descriptor) => {
        // Get metadata for a computed property
        if (!descriptor) return null;

        return {
          getter: descriptor._getter || descriptor.get,
          setter: descriptor.set,
          readOnly: descriptor._readOnly || false,
          auto: descriptor._auto || false,
          dependentKeys: descriptor._dependentKeys || [],
          code: descriptor._getter?.toString() || descriptor.get?.toString(),
        };
      },
    },
    runloop: {
      getBackburner: () => {
        // Try to get _backburner from Ember.run or @ember/runloop
        if (legacyEmber.Runloop?._backburner) {
          return legacyEmber.Runloop._backburner;
        }
        if (legacyEmber.Runloop?.backburner) {
          return legacyEmber.Runloop.backburner;
        }
        return null;
      },
      join: legacyEmber.Runloop?.join,
      debounce: legacyEmber.Runloop?.debounce,
      cancel: legacyEmber.Runloop?.cancel,
    },
  };
}

// Helper functions for buildRouteTree
function routeHasBeenDefined(owner, routeName) {
  const factory = owner.factoryFor
    ? owner.factoryFor(`route:${routeName}`)
    : owner._lookupFactory?.(`route:${routeName}`);
  return !!factory;
}

function getClassName(owner, name) {
  // Simplified - just return the name
  // Full implementation would need resolver and module prefix logic
  return name.replace(/\./g, '/');
}

function buildSubTree(owner, routeTree, route, router) {
  const handlers = route.handlers;
  let subTree = routeTree;

  for (let i = 0; i < handlers.length; i++) {
    const item = handlers[i];
    const handler = item.handler;

    // Skip loading/error routes that haven't been defined
    if (handler.match(/(loading|error)$/)) {
      if (!routeHasBeenDefined(owner, handler)) {
        continue;
      }
    }

    if (subTree[handler] === undefined) {
      const routeClassName = getClassName(owner, handler);

      // eslint-disable-next-line ember/no-private-routing-service
      const routerLib = router._routerMicrolib || router.router;
      let routeHandler;
      if (routerLib.getRoute) {
        routeHandler = routerLib.getRoute(handler);
      } else if (routerLib.getHandler) {
        routeHandler = routerLib.getHandler(handler);
      }

      let controllerName;
      let controllerClassName;
      let templateName;
      let controllerFactory;

      // Skip when route is an unresolved promise
      if (typeof routeHandler?.then === 'function') {
        controllerName = '(unresolved)';
        controllerClassName = '(unresolved)';
        templateName = '(unresolved)';
      } else {
        const get =
          routeHandler?.get ||
          function (prop) {
            return this?.[prop];
          };
        controllerName =
          get.call(routeHandler, 'controllerName') ||
          routeHandler?.routeName ||
          handler;
        controllerFactory = owner.factoryFor
          ? owner.factoryFor(`controller:${controllerName}`)
          : owner._lookupFactory?.(`controller:${controllerName}`);
        controllerClassName = getClassName(owner, controllerName);
        templateName = getClassName(owner, handler);
      }

      subTree[handler] = {
        value: {
          name: handler,
          routeHandler: {
            className: routeClassName,
            name: handler,
          },
          controller: {
            className: controllerClassName,
            name: controllerName,
            exists: !!controllerFactory,
          },
          template: {
            name: templateName,
          },
        },
      };

      // Add URL for leaf routes
      if (i === handlers.length - 1) {
        subTree[handler].value.url = {
          path: route.segments
            ?.map((segment) => {
              if (segment.type === 0) {
                return segment.value;
              }
              return `:${segment.value}`;
            })
            .join('/'),
        };
      }

      subTree[handler].children = {};
    }
    subTree = subTree[handler].children;
  }
}

function arrayizeChildren(routeTree) {
  const tree = { ...routeTree };

  if (tree.children) {
    const childrenArray = [];
    for (const key in tree.children) {
      if (Object.prototype.hasOwnProperty.call(tree.children, key)) {
        const child = tree.children[key];
        childrenArray.push(arrayizeChildren(child));
      }
    }
    tree.children = childrenArray;
  }

  return tree;
}

// Export the API as a singleton
export const emberInspectorAPI = await getEmberInspectorAPI();
