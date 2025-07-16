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

let ArrayProxy,
  Namespace,
  ActionHandler,
  ControllerMixin,
  CoreObject,
  Application,
  MutableArray,
  MutableEnumerable,
  NativeArray,
  Component,
  Observable,
  Evented,
  PromiseProxyMixin,
  Service,
  ObjectProxy,
  VERSION,
  ComputedProperty,
  meta,
  get,
  set,
  computed,
  EmberObject,
  captureRenderTree,
  getEnv;

let Debug = emberSafeRequire('@ember/debug');
let InternalsMetal = emberSafeRequire('@ember/-internals/metal');
let InternalsRuntime = emberSafeRequire('@ember/-internals/runtime');
let InternalsUtils = emberSafeRequire('@ember/-internals/utils');
let InternalsViews = emberSafeRequire('@ember/-internals/views');
let EmberDestroyable = emberSafeRequire('@ember/destroyable');
let ObjectInternals = emberSafeRequire('@ember/object/internals');
let Instrumentation = emberSafeRequire('@ember/instrumentation');
let Runloop = emberSafeRequire('@ember/runloop');

let RSVP = emberSafeRequire('rsvp');

let GlimmerComponent = emberSafeRequire('@glimmer/component');
let GlimmerManager = emberSafeRequire('@glimmer/manager');
let GlimmerReference = emberSafeRequire('@glimmer/reference');
let GlimmerRuntime = emberSafeRequire('@glimmer/runtime');
let GlimmerUtil = emberSafeRequire('@glimmer/util');
let GlimmerValidator = emberSafeRequire('@glimmer/validator');

let inspect = Debug?.inspect || InternalsUtils?.inspect;
let subscribe = Instrumentation?.subscribe;
let cacheFor = ObjectInternals?.cacheFor;
let guidFor = ObjectInternals?.guidFor;
let libraries = InternalsMetal?.libraries;

if (Ember) {
  captureRenderTree = Ember._captureRenderTree;
  getEnv = () => Ember.ENV;
  ArrayProxy = Ember.ArrayProxy;
  ObjectProxy = Ember.ObjectProxy;
  MutableArray = Ember.MutableArray;
  Namespace = Ember.Namespace;
  MutableEnumerable = Ember.MutableEnumerable;
  NativeArray = Ember.NativeArray;
  ControllerMixin = Ember.ControllerMixin;
  CoreObject = Ember.CoreObject;
  Application = Ember.Application;
  Component = Ember.Component;
  Observable = Ember.Observable;
  Evented = Ember.Evented;
  PromiseProxyMixin = Ember.PromiseProxyMixin;
  Service = Ember.Service;
  EmberObject = Ember.Object;
  VERSION = Ember.VERSION;
  ComputedProperty = Ember.ComputedProperty;
  meta = Ember.meta;
  get = Ember.get;
  set = Ember.set;
  computed = Ember.computed;
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
  captureRenderTree = emberSafeRequire('@ember/debug')?.captureRenderTree;
  getEnv = emberSafeRequire('@ember/-internals/environment')?.getENV;
  ArrayProxy = emberSafeRequire('@ember/array/proxy')?.default;
  ObjectProxy = emberSafeRequire('@ember/object/proxy')?.default;
  MutableArray = emberSafeRequire('@ember/array/mutable')?.default;
  Namespace = emberSafeRequire('@ember/application/namespace')?.default;
  MutableEnumerable = emberSafeRequire('@ember/enumerable/mutable')?.default;
  NativeArray = emberSafeRequire('@ember/array')?.NativeArray;
  ControllerMixin = emberSafeRequire('@ember/controller')?.ControllerMixin;
  CoreObject = emberSafeRequire('@ember/object/core')?.default;
  Application = emberSafeRequire('@ember/application')?.default;
  Component = emberSafeRequire('@ember/component')?.default;
  Observable = emberSafeRequire('@ember/object/observable')?.default;
  Evented = emberSafeRequire('@ember/object/evented')?.default;
  PromiseProxyMixin = emberSafeRequire(
    '@ember/object/promise-proxy-mixin',
  )?.default;
  Service = emberSafeRequire('@ember/service')?.default;
  EmberObject = emberSafeRequire('@ember/object')?.default;
  VERSION = emberSafeRequire('ember/version')?.default;
  ComputedProperty = emberSafeRequire(
    '@ember/-internals/metal',
  )?.ComputedProperty;
  meta = emberSafeRequire('@ember/-internals/meta')?.meta;
  set = emberSafeRequire('@ember/object')?.set;
  get = emberSafeRequire('@ember/object')?.get;
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
};
