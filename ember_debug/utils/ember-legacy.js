/* eslint-disable ember/new-module-imports */
/**
 * Legacy Ember Module Loader
 *
 * This file contains the old implementation that directly imports Ember modules.
 * It's used as a fallback when the new inspector API is not available.
 */

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
  ApplicationModule,
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
Owner = Owner ?? emberSafeRequire('@ember/owner');
ApplicationModule = ApplicationModule ?? emberSafeRequire('@ember/application');

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
}

if (Owner) {
  getOwner = Owner.getOwner;
} else {
  getOwner = ApplicationModule?.getOwner;
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
