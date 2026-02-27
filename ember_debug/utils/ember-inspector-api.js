/* eslint-disable no-undef */
/* eslint-disable ember/no-private-routing-service */
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

/**
 * STUB: This would be provided by ember-source
 *
 * For now, this falls back to the old implementation to maintain compatibility.
 * Once ember-source implements the API, this file can be removed.
 */
export const emberInspectorAPI = {
  // Owner and Container APIs
  owner: {
    /**
     * Get the owner (DI container) of an object
     */
    getOwner(obj) {
      // STUB: Would be implemented by ember-source
      // For now, fall back to existing implementation
      const { getOwner } = require('../ember/owner');
      return getOwner(obj);
    },

    /**
     * Look up a registered instance
     */
    lookup(owner, fullName) {
      // STUB: Would be implemented by ember-source
      return owner.lookup(fullName);
    },

    /**
     * Get factory for a registration
     */
    factoryFor(owner, fullName) {
      // STUB: Would be implemented by ember-source
      return owner.factoryFor
        ? owner.factoryFor(fullName)
        : owner._lookupFactory(fullName);
    },

    /**
     * Resolve a registration without instantiating
     */
    resolveRegistration(owner, fullName) {
      // STUB: Would be implemented by ember-source
      return owner.resolveRegistration(fullName);
    },

    /**
     * Check if a registration exists
     */
    hasRegistration(owner, fullName) {
      // STUB: Would be implemented by ember-source
      return owner.hasRegistration(fullName);
    },

    /**
     * Check if owner is destroyed
     */
    isDestroyed(owner) {
      // STUB: Would be implemented by ember-source
      return owner?.isDestroyed || false;
    },

    /**
     * Check if owner is destroying
     */
    isDestroying(owner) {
      // STUB: Would be implemented by ember-source
      return owner?.isDestroying || false;
    },

    /**
     * HIGH-LEVEL API: Get all instantiated objects grouped by type
     *
     * This replaces direct access to owner.__container__.cache
     * and handles all version differences internally.
     *
     * @param {Owner} owner - The owner instance
     * @param {Object} options - Filtering options
     * @param {Array<string>} options.excludeTypes - Types to exclude
     * @param {boolean} options.includePrivate - Whether to include private types
     * @returns {Object} Map of type names to arrays of instances
     */
    getContainerInstances(owner, options = {}) {
      // STUB: Would be implemented by ember-source
      // This is what ember-source would implement to replace the complex logic

      const { excludeTypes = [], includePrivate = false } = options;
      const instancesByType = {};

      // Access container cache (this would be internal to ember-source)
      let cache = owner.__container__.cache;

      // Handle InheritingDict (Ember < 1.8) - ember-source knows its own version
      if (
        typeof cache.dict !== 'undefined' &&
        typeof cache.eachLocal !== 'undefined'
      ) {
        cache = cache.dict;
      }

      // Iterate and group by type
      for (let key in cache) {
        const type = key.split(':').shift();

        // Filter private types
        if (!includePrivate && type[0] === '-') {
          continue;
        }

        // Filter excluded types
        if (excludeTypes.indexOf(type) !== -1) {
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
  },

  // Router APIs
  router: {
    /**
     * HIGH-LEVEL API: Build complete route tree with all metadata
     *
     * This replaces 150+ lines of complex logic that:
     * - Accesses router internals
     * - Handles version differences
     * - Resolves controller names
     * - Checks factory existence
     * - Parses URL segments
     * - Handles unresolved promises
     * - Builds hierarchical structure
     *
     * @param {Owner} owner - The owner instance
     * @returns {Object} Complete route tree with hierarchy and metadata
     */
    // eslint-disable-next-line no-unused-vars
    buildRouteTree(owner) {
      // STUB: Would be implemented by ember-source
      // This is a complex implementation that ember-source would provide

      // For now, fall back to existing implementation
      // In production, ember-source would implement this properly
      throw new Error(
        'buildRouteTree API not yet implemented by ember-source. ' +
          'This is a stub showing what the API would look like.',
      );

      // The actual implementation would:
      // 1. Access router._routerMicrolib.recognizer.names
      // 2. Iterate all routes and build tree structure
      // 3. Handle version differences (getRoute vs getHandler)
      // 4. Resolve controller names and check factory existence
      // 5. Parse URL segments and format URLs
      // 6. Handle unresolved promises
      // 7. Return structured tree

      // Example return value:
      // {
      //   children: [
      //     {
      //       value: {
      //         name: "application",
      //         type: "resource",
      //         routeHandler: { className: "application", name: "application" },
      //         controller: { className: "application", name: "application", exists: true },
      //         template: { name: "application" }
      //       },
      //       children: [...]
      //     }
      //   ]
      // }
    },

    /**
     * Get a route handler instance by name
     */
    getRouteHandler(owner, routeName) {
      // STUB: Would be implemented by ember-source
      const router = owner.lookup('router:main');
      const routerLib = router._routerMicrolib || router.router;

      // Handle version differences internally
      if (routerLib.getRoute) {
        return routerLib.getRoute(routeName);
      } else {
        return routerLib.getHandler(routeName);
      }
    },

    /**
     * Get the current route path
     */
    getCurrentPath(owner) {
      // STUB: Would be implemented by ember-source
      return owner.router?.currentPath;
    },

    /**
     * Get the current URL
     */
    getCurrentURL(owner) {
      // STUB: Would be implemented by ember-source
      return owner.router?.currentURL;
    },

    /**
     * Format a URL using the application's location implementation
     */
    formatURL(owner, url) {
      // STUB: Would be implemented by ember-source
      const router = owner.lookup('router:main');
      return router.location.formatURL(url);
    },
  },

  // Application and Module Resolution APIs
  application: {
    /**
     * Resolve a registration name to its module path
     */
    resolveModulePath(owner, fullName) {
      // STUB: Would be implemented by ember-source
      const resolver = owner.application?.__registry__?.resolver;
      if (!resolver) return null;

      if (resolver.lookupDescription) {
        return resolver.lookupDescription(fullName);
      } else if (resolver.describe) {
        return resolver.describe(fullName);
      }

      return null;
    },

    /**
     * Get Ember CLI configuration
     */
    // eslint-disable-next-line no-unused-vars
    getEmberCliConfig(owner) {
      // STUB: Would be implemented by ember-source
      // This would be provided by ember-source based on the app's configuration
      return null;
    },

    /**
     * Get owner from application instance
     */
    getOwnerFromApplication(application) {
      // STUB: Would be implemented by ember-source
      if (application.autoboot) {
        return application.__deprecatedInstance__;
      } else if (application._applicationInstances) {
        return [...application._applicationInstances][0];
      }
      return null;
    },

    /**
     * Find the Ember Application instance from registered namespaces
     */
    getApplication() {
      // STUB: Would be implemented by ember-source
      const { Application, Namespace } = require('../utils/ember');
      let application;
      Namespace.NAMESPACES.forEach((namespace) => {
        if (namespace instanceof Application) {
          application = namespace;
          return false;
        }
      });
      return application;
    },
  },

  // Computed property utilities
  computed: {
    /**
     * Check if a property is computed
     */
    isComputed(obj, key) {
      // STUB: Would be implemented by ember-source

      const { isComputed } = require('./type-check');
      return isComputed(obj, key);
    },

    /**
     * Get computed property descriptor
     */
    getComputedPropertyDescriptor(obj, key) {
      // STUB: Would be implemented by ember-source
      const { getDescriptorFor } = require('./type-check');
      return getDescriptorFor(obj, key);
    },

    /**
     * Get dependent keys for a computed property
     */
    getDependentKeys(obj, key) {
      // STUB: Would be implemented by ember-source
      const desc = this.getComputedPropertyDescriptor(obj, key);
      return desc?._dependentKeys || [];
    },

    /**
     * Get computed property metadata without accessing private properties.
     * This replaces direct access to desc._getter, desc._readOnly, desc._auto, etc.
     *
     * @param {Object} descriptor - The computed property descriptor
     * @returns {Object} Public metadata object
     */
    getComputedMetadata(descriptor) {
      // STUB: Would be implemented by ember-source
      // For now, fall back to accessing private properties
      // In production, ember-source would provide this as a public API

      if (!descriptor) {
        return null;
      }

      return {
        getter: descriptor._getter || descriptor.get,
        setter: descriptor.set,
        readOnly: descriptor._readOnly || false,
        auto: descriptor._auto || false,
        dependentKeys: descriptor._dependentKeys || [],
        code: descriptor._getter
          ? Function.prototype.toString.call(descriptor._getter)
          : descriptor.get
            ? Function.prototype.toString.call(descriptor.get)
            : '',
      };
    },

    /**
     * Check if a descriptor is Ember's mandatory setter.
     * This replaces checking for "You attempted to update" string in setter code.
     *
     * @param {Object} descriptor - The property descriptor
     * @returns {boolean} True if this is a mandatory setter
     */
    isMandatorySetter(descriptor) {
      // STUB: Would be implemented by ember-source
      // For now, fall back to string checking
      // In production, ember-source would provide this as a public API

      if (!descriptor?.set) {
        return false;
      }

      // Check for Ember's mandatory setter error message
      return Function.prototype.toString
        .call(descriptor.set)
        .includes('You attempted to update');
    },

    /**
     * Check if a property uses the @cached decorator from @glimmer/tracking.
     * The @cached decorator memoizes getter results and invalidates when dependencies change.
     *
     * @param {Object} obj - The object
     * @param {string} key - The property name
     * @returns {boolean} True if the property uses @cached decorator
     */
    isCached(obj, key) {
      // STUB: Would be implemented by ember-source
      // For now, try to detect @cached by checking for specific patterns
      // In production, ember-source would provide this as a public API

      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      if (!descriptor?.get) {
        return false;
      }

      // @cached creates a native getter with a special tag
      // Ember would know internally if a property is cached
      // For now, we can check if it has a getter and is tracked
      // but not a computed property (computed properties have _getter)

      const isComputed = require('./type-check').isComputed;
      if (isComputed(obj, key)) {
        return false;
      }

      // Check if the getter has tracking metadata
      // This is a heuristic - ember-source would have definitive knowledge
      try {
        const { tagForProperty } = require('../utils/ember');
        const tag = tagForProperty(obj, key);
        // If it has a tag but isn't computed, it's likely @cached or @tracked
        return !!tag;
      } catch {
        return false;
      }
    },
  },

  // Render tree debugging
  renderTree: {
    /**
     * Get the debug render tree instance for component inspection.
     * This replaces direct access to renderer._debugRenderTree or service._debugRenderTree.
     *
     * @param {Owner} owner - The owner instance
     * @returns {Object|null} The debug render tree instance or null
     */
    getDebugRenderTree(owner) {
      // STUB: Would be implemented by ember-source
      // For now, fall back to accessing private properties
      // In production, ember-source would provide this as a public API

      const renderer = owner.lookup('renderer:-dom');
      if (renderer?.debugRenderTree) {
        return renderer.debugRenderTree;
      }

      const glimmerEnv = owner.lookup('service:-glimmer-environment');
      if (glimmerEnv?._debugRenderTree) {
        return glimmerEnv._debugRenderTree;
      }

      return null;
    },
  },
};

/**
 * USAGE NOTES:
 *
 * 1. This stub file demonstrates the API interface
 * 2. In production, ember-source would provide this via loadCompatInspector()
 * 3. The inspector would access it as:
 *    const api = globalThis.emberInspectorApps[0].loadCompatInspector();
 * 4. Once ember-source implements the API, this stub can be removed
 * 5. The new implementations (*-new-api.js files) show how to use the API
 */
