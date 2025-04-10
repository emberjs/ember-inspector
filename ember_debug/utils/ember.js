/* eslint-disable ember/new-module-imports */
let Ember;

try {
  Ember = requireModule('ember/barrel').default;
} catch {
  // pass through
}

try {
  Ember = Ember || requireModule('ember').default;
} catch {
  Ember = window.Ember;
}

const wrappedRequire = function (id) {
  try {
    return Ember.__loader.require(id);
  } catch {
    return requireModule(id);
  }
};

export function emberSafeRequire(id) {
  try {
    return wrappedRequire(id);
  } catch {
    return undefined;
  }
}

let Application,
  Namespace,
  ActionHandler,
  ControllerMixin,
  CoreObject,
  Debug,
  MutableEnumerable,
  NativeArray,
  ArrayProxy,
  MutableArray,
  Component,
  Observable,
  Evented,
  PromiseProxyMixin,
  Service,
  ObjectProxy,
  InternalsMetal,
  InternalsRuntime,
  InternalsUtils,
  InternalsViews,
  EmberDestroyable,
  ObjectInternals,
  Instrumentation,
  Runloop,
  GlimmerComponent,
  GlimmerManager,
  GlimmerReference,
  GlimmerRuntime,
  GlimmerUtil,
  GlimmerValidator,
  RSVP,
  VERSION,
  ComputedProperty,
  meta,
  get,
  set,
  computed,
  EmberObject,
  Owner,
  captureRenderTree,
  getEnv,
  getOwner;

// This global is defined in Embroider to bring Vite support to the Inspector.
// Having it defined is enough to assert the inspected app runs with Vite.
if (globalThis.emberInspectorApps) {
  // emberInspectorApps has been implemented as a map to support multiple apps
  // in the future. So far, the inspector has supported only one app, so we
  // rely on the first item in the map to keep the current behavior.
  const appLoader = globalThis.emberInspectorApps.entries().next().value[1];
  const internalEmberModules = await appLoader.loadCompatInspector();

  Application = internalEmberModules.Application.default;
  Namespace = internalEmberModules.ApplicationNamespace.default;
  NativeArray = internalEmberModules.Array.NativeArray;
  MutableArray = internalEmberModules.ArrayMutable.default;
  ArrayProxy = internalEmberModules.ArrayProxy.default;
  Component = internalEmberModules.Component.default;
  ControllerMixin = internalEmberModules.Controller.ControllerMixin;
  Debug = internalEmberModules.Debug;
  CoreObject = internalEmberModules.ObjectCore.default;
  MutableEnumerable = internalEmberModules.EnumerableMutable.default;
  getEnv = internalEmberModules.InternalsEnvironment?.getENV;
  meta = internalEmberModules.InternalsMeta?.meta;
  InternalsMetal = internalEmberModules.InternalsMetal;
  ComputedProperty = InternalsMetal?.ComputedProperty;
  InternalsRuntime = internalEmberModules.InternalsRuntime;
  InternalsUtils = internalEmberModules.InternalsUtils;
  InternalsViews = internalEmberModules.InternalViews;
  ObjectInternals = internalEmberModules.ObjectInternals;
  Instrumentation = internalEmberModules.Instrumentation;
  captureRenderTree = internalEmberModules.Debug.captureRenderTree;
  ObjectProxy = internalEmberModules.ObjectProxy.default;
  Observable = internalEmberModules.ObjectObservable.default;
  Evented = internalEmberModules.ObjectEvented.default;
  PromiseProxyMixin = internalEmberModules.ObjectPromiseProxyMixin.default;
  Runloop = internalEmberModules.Runloop;
  Service = internalEmberModules.Service.default;
  EmberDestroyable = internalEmberModules.EmberDestroyable;
  EmberObject = internalEmberModules.Object.default;
  VERSION = internalEmberModules.VERSION.default;
  set = internalEmberModules.Object.set;
  get = internalEmberModules.Object.get;
  RSVP = internalEmberModules.RSVP;
  GlimmerComponent = internalEmberModules.GlimmerComponent;
  GlimmerManager = internalEmberModules.GlimmerManager;
  GlimmerReference = internalEmberModules.GlimmerReference;
  GlimmerRuntime = internalEmberModules.GlimmerRuntime;
  GlimmerUtil = internalEmberModules.GlimmerUtil;
  GlimmerValidator = internalEmberModules.GlimmerValidator;
  Owner = internalEmberModules.Owner.default;
}

Debug = Debug ?? emberSafeRequire('@ember/debug');
InternalsMetal = InternalsMetal ?? emberSafeRequire('@ember/-internals/metal');
InternalsRuntime =
  InternalsRuntime ?? emberSafeRequire('@ember/-internals/runtime');
InternalsUtils = InternalsUtils ?? emberSafeRequire('@ember/-internals/utils');
InternalsViews = InternalsViews ?? emberSafeRequire('@ember/-internals/views');
EmberDestroyable = EmberDestroyable ?? emberSafeRequire('@ember/destroyable');
ObjectInternals =
  ObjectInternals ?? emberSafeRequire('@ember/object/internals');
Instrumentation = Instrumentation ?? emberSafeRequire('@ember/instrumentation');
Runloop = Runloop ?? emberSafeRequire('@ember/runloop');
RSVP = RSVP ?? emberSafeRequire('rsvp');
GlimmerComponent = GlimmerComponent ?? emberSafeRequire('@glimmer/component');
GlimmerManager = GlimmerManager ?? emberSafeRequire('@glimmer/manager');
GlimmerReference = GlimmerReference ?? emberSafeRequire('@glimmer/reference');
GlimmerRuntime = GlimmerRuntime ?? emberSafeRequire('@glimmer/runtime');
GlimmerUtil = GlimmerUtil ?? emberSafeRequire('@glimmer/util');
GlimmerValidator = GlimmerValidator ?? emberSafeRequire('@glimmer/validator');

let inspect = Debug?.inspect || InternalsUtils?.inspect;
let subscribe = Instrumentation?.subscribe;
let cacheFor = ObjectInternals?.cacheFor;
let guidFor = ObjectInternals?.guidFor;
let libraries = InternalsMetal?.libraries;

if (Ember) {
  Application = Ember.Application;
  Namespace = Ember.Namespace;
  ArrayProxy = Ember.ArrayProxy;
  MutableArray = Ember.MutableArray;
  MutableEnumerable = Ember.MutableEnumerable;
  NativeArray = Ember.NativeArray;
  ControllerMixin = Ember.ControllerMixin;
  CoreObject = Ember.CoreObject;
  Component = Ember.Component;
  Observable = Ember.Observable;
  Evented = Ember.Evented;
  PromiseProxyMixin = Ember.PromiseProxyMixin;
  Service = Ember.Service;
  ObjectProxy = Ember.ObjectProxy;
  VERSION = Ember.VERSION;
  ComputedProperty = Ember.ComputedProperty;
  meta = Ember.meta;
  get = Ember.get;
  set = Ember.set;
  computed = Ember.computed;
  EmberObject = Ember.Object;
  captureRenderTree = Ember._captureRenderTree;
  getEnv = () => Ember.ENV;
  ActionHandler = Ember.ActionHandler;
  Debug = Debug ?? Ember.Debug;
  inspect = inspect ?? Ember.inspect;
  Instrumentation = Instrumentation ?? Ember.Instrumentation;
  subscribe = subscribe ?? Ember.subscribe;
  RSVP = RSVP ?? Ember.RSVP;
  Runloop = Runloop ?? Ember.run;
  cacheFor = cacheFor ?? Ember.cacheFor;
  guidFor = guidFor ?? Ember.guidFor;
  libraries = libraries ?? Ember.libraries;
} else {
  captureRenderTree =
    captureRenderTree ?? emberSafeRequire('@ember/debug')?.captureRenderTree;
  getEnv = getEnv ?? emberSafeRequire('@ember/-internals/environment')?.getENV;
  ArrayProxy = ArrayProxy ?? emberSafeRequire('@ember/array/proxy')?.default;
  ObjectProxy = ObjectProxy ?? emberSafeRequire('@ember/object/proxy')?.default;
  MutableArray =
    MutableArray ?? emberSafeRequire('@ember/array/mutable')?.default;
  Namespace =
    Namespace ?? emberSafeRequire('@ember/application/namespace')?.default;
  MutableEnumerable =
    MutableEnumerable ?? emberSafeRequire('@ember/enumerable/mutable')?.default;
  NativeArray = NativeArray ?? emberSafeRequire('@ember/array')?.NativeArray;
  ControllerMixin =
    ControllerMixin ?? emberSafeRequire('@ember/controller')?.ControllerMixin;
  CoreObject = CoreObject ?? emberSafeRequire('@ember/object/core')?.default;
  Application = Application ?? emberSafeRequire('@ember/application')?.default;
  Component = Component ?? emberSafeRequire('@ember/component')?.default;
  Observable =
    Observable ?? emberSafeRequire('@ember/object/observable')?.default;
  Evented = Evented ?? emberSafeRequire('@ember/object/evented')?.default;
  PromiseProxyMixin =
    PromiseProxyMixin ??
    emberSafeRequire('@ember/object/promise-proxy-mixin')?.default;
  Service = Service ?? emberSafeRequire('@ember/service')?.default;
  EmberObject = EmberObject ?? emberSafeRequire('@ember/object')?.default;
  VERSION = VERSION ?? emberSafeRequire('ember/version')?.default;
  ComputedProperty =
    ComputedProperty ??
    emberSafeRequire('@ember/-internals/metal')?.ComputedProperty;
  meta = meta ?? emberSafeRequire('@ember/-internals/meta')?.meta;
  set = set ?? emberSafeRequire('@ember/object')?.set;
  get = get ?? emberSafeRequire('@ember/object')?.get;
  Owner = Owner ?? emberSafeRequire('@ember/owner')?.default;
}

if (Owner) {
  getOwner = Owner.getOwner;
} else {
  getOwner = Application.getOwner;
}

export {
  Runloop,
  Debug,
  InternalsMetal,
  InternalsRuntime,
  InternalsUtils,
  InternalsViews,
  ObjectInternals,
  Instrumentation,
  RSVP,
  ArrayProxy,
  Namespace,
  ActionHandler,
  Application,
  ControllerMixin,
  MutableArray,
  MutableEnumerable,
  NativeArray,
  CoreObject,
  ObjectProxy,
  Component,
  Observable,
  Evented,
  Service,
  PromiseProxyMixin,
  EmberDestroyable,
  EmberObject,
  VERSION,
  ComputedProperty,
  meta,
  computed,
  get,
  set,
  captureRenderTree,
  getEnv,
  inspect,
  subscribe,
  cacheFor,
  guidFor,
  libraries,
  GlimmerComponent,
  GlimmerManager,
  GlimmerReference,
  GlimmerRuntime,
  GlimmerUtil,
  GlimmerValidator,
  getOwner,
};
