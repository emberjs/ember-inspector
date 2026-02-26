/* eslint-disable ember/new-module-imports */

/**
 * Ember Inspector API Adapter
 * 
 * This module provides access to Ember's internal APIs through the new
 * public inspector API provided by appLoader.loadCompatInspector().
 * 
 * The new API structure eliminates the need to import internal modules
 * and provides a stable, version-independent interface.
 */

let emberInspectorAPI = null;

// Check if we're running in a Vite/Embroider environment with the new API
if (globalThis.emberInspectorApps) {
  const appLoader = globalThis.emberInspectorApps[0];
  emberInspectorAPI = await appLoader.loadCompatInspector();
}

if (!emberInspectorAPI) {
  throw new Error(
    'Ember Inspector API not available. This version of ember-inspector requires ' +
    'ember-source to provide the inspector API via appLoader.loadCompatInspector().'
  );
}

// Export the API namespaces directly
export const {
  debug,
  environment,
  instrumentation,
  objectInternals,
  owner,
  libraries,
  typeChecking,
  naming,
  tracking,
  computed,
  runloop,
} = emberInspectorAPI;

// Export commonly used functions with their original names for backward compatibility
export const captureRenderTree = debug.captureRenderTree;
export const inspect = debug.inspect;
export const registerDeprecationHandler = debug.registerDeprecationHandler;

export const getEnv = environment.getEnv;
export const VERSION = environment.VERSION;

export const subscribe = instrumentation.subscribe;

// Glimmer internals (for render-tree.js compatibility)
export const GlimmerRuntime = instrumentation?.GlimmerRuntime;
export const GlimmerManager = instrumentation?.GlimmerManager;
export const GlimmerReference = instrumentation?.GlimmerReference;
export const GlimmerUtil = instrumentation?.GlimmerUtil;
export const EmberDestroyable = instrumentation?.EmberDestroyable;

export const cacheFor = objectInternals.cacheFor;
export const guidFor = objectInternals.guidFor;
export const meta = objectInternals.meta;
export const get = objectInternals.get;
export const set = objectInternals.set;

export const getOwner = owner.getOwner;

// Libraries (RSVP, Application, Namespace, etc.)
export const RSVP = libraries?.RSVP;
export const Application = libraries?.Application;
export const Namespace = libraries?.Namespace;

// Type checking functions (replaces instanceof checks)
export const isEmberObject = typeChecking.isEmberObject;
export const isComponent = typeChecking.isComponent;
export const isGlimmerComponent = typeChecking.isGlimmerComponent;
export const isService = typeChecking.isService;
export const isObjectProxy = typeChecking.isObjectProxy;
export const isArrayProxy = typeChecking.isArrayProxy;
export const isCoreObject = typeChecking.isCoreObject;
export const isApplication = typeChecking.isApplication;
export const isNamespace = typeChecking.isNamespace;
export const hasObservable = typeChecking.hasObservable;
export const hasEvented = typeChecking.hasEvented;
export const hasPromiseProxyMixin = typeChecking.hasPromiseProxyMixin;
export const hasControllerMixin = typeChecking.hasControllerMixin;
export const isMutableArray = typeChecking.isMutableArray;
export const isMutableEnumerable = typeChecking.isMutableEnumerable;
export const isNativeArray = typeChecking.isNativeArray;

// Name resolution
export const getClassName = naming.getClassName;

// Tracking API
export const createPropertyTracker = tracking.createPropertyTracker;
export const hasPropertyChanged = tracking.hasPropertyChanged;
export const getPropertyDependencies = tracking.getPropertyDependencies;
export const getChangedDependencies = tracking.getChangedDependencies;
export const isTrackedProperty = tracking.isTrackedProperty;

// Computed property utilities
export const isComputed = computed.isComputed;
export const getComputedPropertyDescriptor = computed.getComputedPropertyDescriptor;
export const getDependentKeys = computed.getDependentKeys;

// Runloop
export const getBackburner = runloop.getBackburner;
export const join = runloop.join;
export const debounce = runloop.debounce;
export const cancel = runloop.cancel;

// Legacy exports for compatibility (these are now just references to the API)
// These are kept to minimize changes in other files
export const Debug = { inspect, registerDeprecationHandler };
export const Instrumentation = { subscribe };
export const ObjectInternals = { cacheFor, guidFor };
export const Runloop = { join, debounce, cancel, getBackburner };

// Note: The following exports are no longer needed as we use type checking functions:
// - Application, Namespace, Component, Service, etc. (classes)
// - InternalsMetal, InternalsRuntime, InternalsUtils, InternalsViews (internal modules)
// - GlimmerComponent, GlimmerValidator, etc. (Glimmer internals)
// 
// Code that previously used `instanceof` checks should now use the type checking functions.
// Code that previously accessed class names should now use `getClassName()`.