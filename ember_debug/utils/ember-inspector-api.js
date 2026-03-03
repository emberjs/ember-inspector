/* eslint-disable no-undef */
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


  // Import the legacy implementation
  // Use dynamic require to avoid circular dependencies
  const legacyEmber = require('./ember-legacy');

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
      getOwner: legacyEmber.getOwner,
    },
    libraries: {
      RSVP: legacyEmber.RSVP,
    },
    typeChecking: {
      // These would need to be implemented in the legacy module
      // For now, provide basic implementations
      isEmberObject: (obj) =>
        obj &&
        typeof obj === 'object' &&
        obj.constructor?.name?.includes('Ember'),
      isComponent: (obj) => obj && obj.constructor?.name === 'Component',
      isGlimmerComponent: (obj) =>
        obj && obj.constructor?.name === 'GlimmerComponent',
      isService: (obj) => obj && obj.constructor?.name === 'Service',
      isObjectProxy: (obj) => obj && obj.constructor?.name === 'ObjectProxy',
      isArrayProxy: (obj) => obj && obj.constructor?.name === 'ArrayProxy',
      isCoreObject: (obj) => obj && obj.constructor?.name === 'CoreObject',
      isApplication: (obj) => obj && obj.constructor?.name === 'Application',
      isNamespace: (obj) => obj && obj.constructor?.name === 'Namespace',
      hasObservable: (obj) => obj && typeof obj.addObserver === 'function',
      hasEvented: (obj) => obj && typeof obj.on === 'function',
      hasPromiseProxyMixin: (obj) =>
        obj && typeof obj.then === 'function' && obj.content !== undefined,
      hasControllerMixin: (obj) =>
        obj && obj.target !== undefined && obj.model !== undefined,
      isMutableArray: (obj) =>
        Array.isArray(obj) || (obj && typeof obj.pushObject === 'function'),
      isMutableEnumerable: (obj) => obj && typeof obj.forEach === 'function',
      isNativeArray: (obj) => Array.isArray(obj),
    },
    naming: {
      getClassName: (obj) => obj?.constructor?.name || null,
    },
    tracking: {
      createPropertyTracker: () => ({}),
      hasPropertyChanged: () => false,
      getPropertyDependencies: () => [],
      getChangedDependencies: () => [],
      isTrackedProperty: () => false,
    },
    computed: {
      isComputed: legacyEmber.Debug?.isComputed || (() => false),
      getComputedPropertyDescriptor: (obj, key) => obj?.[key],
      getDependentKeys: () => [],
    },
    runloop: {
      getBackburner: legacyEmber.Runloop?.getBackburner,
      join: legacyEmber.Runloop?.join,
      debounce: legacyEmber.Runloop?.debounce,
      cancel: legacyEmber.Runloop?.cancel,
    },
  };
}

// Export the API as a singleton
export const emberInspectorAPI = await getEmberInspectorAPI();
