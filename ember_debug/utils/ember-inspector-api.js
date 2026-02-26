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
      return owner.factoryFor ? owner.factoryFor(fullName) : owner._lookupFactory(fullName);
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
      if (typeof cache.dict !== 'undefined' && typeof cache.eachLocal !== 'undefined') {
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
    buildRouteTree(owner) {
      // STUB: Would be implemented by ember-source
      // This is a complex implementation that ember-source would provide
      
      // For now, fall back to existing implementation
      // In production, ember-source would implement this properly
      throw new Error(
        'buildRouteTree API not yet implemented by ember-source. ' +
        'This is a stub showing what the API would look like.'
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
