/* eslint-disable ember/new-module-imports */
import { Ember, emberSafeRequire } from './ember/global.js';

let ActionHandler,
  Application,
  ApplicationModule,
  ArrayProxy,
  Component,
  ComputedProperty,
  ControllerMixin,
  CoreObject,
  Debug,
  EmberDestroyable,
  EmberObject,
  Evented,
  GlimmerComponent,
  GlimmerManager,
  GlimmerReference,
  GlimmerRuntime,
  GlimmerUtil,
  GlimmerValidator,
  Instrumentation,
  InternalsMetal,
  InternalsRuntime,
  InternalsUtils,
  InternalsViews,
  MutableArray,
  MutableEnumerable,
  Namespace,
  NativeArray,
  ObjectInternals,
  ObjectProxy,
  Observable,
  Owner,
  PromiseProxyMixin,
  RSVP,
  Runloop,
  Service,
  VERSION,
  captureRenderTree,
  computed,
  get,
  getEnv,
  getOwner,
  meta,
  set;

// This global is defined in Embroider to bring Vite support to the Inspector.
// Having it defined is enough to assert the inspected app runs with Vite.
if (globalThis.emberInspectorApps) {
  // emberInspectorApps has been implemented as an array to support multiple
  // apps in the future. So far, the inspector has supported only one app, so
  // we rely on the first item in the array to keep the current behavior.
  const appLoader = globalThis.emberInspectorApps[0];
  const modules = await appLoader.loadCompatInspector();

  Application = modules.Application.default;
  ApplicationModule = modules.Application;
  ArrayProxy = modules.ArrayProxy.default;
  Component = modules.Component.default;
  ComputedProperty = modules.InternalsMetal?.ComputedProperty;
  ControllerMixin = modules.Controller.ControllerMixin;
  CoreObject = modules.ObjectCore.default;
  Debug = modules.Debug;
  EmberDestroyable = modules.EmberDestroyable;
  EmberObject = modules.Object.default;
  Evented = modules.ObjectEvented.default;
  GlimmerComponent = modules.GlimmerComponent;
  GlimmerManager = modules.GlimmerManager;
  GlimmerReference = modules.GlimmerReference;
  GlimmerRuntime = modules.GlimmerRuntime;
  GlimmerUtil = modules.GlimmerUtil;
  GlimmerValidator = modules.GlimmerValidator;
  Instrumentation = modules.Instrumentation;
  InternalsMetal = modules.InternalsMetal;
  InternalsRuntime = modules.InternalsRuntime;
  InternalsUtils = modules.InternalsUtils;
  InternalsViews = modules.InternalsViews;
  MutableArray = modules.ArrayMutable.default;
  MutableEnumerable = modules.EnumerableMutable.default;
  Namespace = modules.ApplicationNamespace.default;
  NativeArray = modules.Array.NativeArray;
  ObjectInternals = modules.ObjectInternals;
  ObjectProxy = modules.ObjectProxy.default;
  Observable = modules.ObjectObservable.default;
  PromiseProxyMixin = modules.ObjectPromiseProxyMixin.default;
  RSVP = modules.RSVP;
  Runloop = modules.Runloop;
  Service = modules.Service.default;
  VERSION = modules.VERSION.default;
  captureRenderTree = modules.Debug.captureRenderTree;
  get = modules.Object.get;
  getEnv = modules.InternalsEnvironment?.getENV;
  meta = modules.InternalsMeta?.meta;
  set = modules.Object.set;
  // owner was not available in all versions of ember that we support
  Owner = modules.Owner;
}

ApplicationModule ??= emberSafeRequire('@ember/application');
Debug ??= emberSafeRequire('@ember/debug');
EmberDestroyable ??= emberSafeRequire('@ember/destroyable');
GlimmerComponent ??= emberSafeRequire('@glimmer/component');
GlimmerManager ??= emberSafeRequire('@glimmer/manager');
GlimmerReference ??= emberSafeRequire('@glimmer/reference');
GlimmerRuntime ??= emberSafeRequire('@glimmer/runtime');
GlimmerUtil ??= emberSafeRequire('@glimmer/util');
GlimmerValidator ??= emberSafeRequire('@glimmer/validator');
Instrumentation ??= emberSafeRequire('@ember/instrumentation');
InternalsMetal ??= emberSafeRequire('@ember/-internals/metal');
InternalsRuntime ??= emberSafeRequire('@ember/-internals/runtime');
InternalsUtils ??= emberSafeRequire('@ember/-internals/utils');
InternalsViews ??= emberSafeRequire('@ember/-internals/views');
ObjectInternals ??= emberSafeRequire('@ember/object/internals');
Owner ??= emberSafeRequire('@ember/owner');
RSVP ??= emberSafeRequire('rsvp');
Runloop ??= emberSafeRequire('@ember/runloop');

let inspect = Debug?.inspect || InternalsUtils?.inspect;
let subscribe = Instrumentation?.subscribe;
let cacheFor = ObjectInternals?.cacheFor;
let guidFor = ObjectInternals?.guidFor;
let libraries = InternalsMetal?.libraries;

if (Ember) {
  ActionHandler = Ember.ActionHandler;
  Application = Ember.Application;
  ArrayProxy = Ember.ArrayProxy;
  Component = Ember.Component;
  ComputedProperty = Ember.ComputedProperty;
  ControllerMixin = Ember.ControllerMixin;
  CoreObject = Ember.CoreObject;
  Debug ??= Ember.Debug;
  EmberObject = Ember.Object;
  Evented = Ember.Evented;
  Instrumentation ??= Ember.Instrumentation;
  MutableArray = Ember.MutableArray;
  MutableEnumerable = Ember.MutableEnumerable;
  Namespace = Ember.Namespace;
  NativeArray = Ember.NativeArray;
  ObjectProxy = Ember.ObjectProxy;
  Observable = Ember.Observable;
  PromiseProxyMixin = Ember.PromiseProxyMixin;
  RSVP ??= Ember.RSVP;
  Runloop ??= Ember.run;
  Service = Ember.Service;
  VERSION = Ember.VERSION;
  cacheFor ??= Ember.cacheFor;
  captureRenderTree = Ember._captureRenderTree;
  computed = Ember.computed;
  get = Ember.get;
  getEnv = () => Ember.ENV;
  guidFor ??= Ember.guidFor;
  inspect ??= Ember.inspect;
  libraries ??= Ember.libraries;
  meta = Ember.meta;
  set = Ember.set;
  subscribe ??= Ember.subscribe;
} else {
  Application ??= emberSafeRequire('@ember/application')?.default;
  ArrayProxy ??= emberSafeRequire('@ember/array/proxy')?.default;
  Component ??= emberSafeRequire('@ember/component')?.default;
  ComputedProperty ??= emberSafeRequire(
    '@ember/-internals/metal',
  )?.ComputedProperty;
  ControllerMixin ??= emberSafeRequire('@ember/controller')?.ControllerMixin;
  CoreObject ??= emberSafeRequire('@ember/object/core')?.default;
  EmberObject ??= emberSafeRequire('@ember/object')?.default;
  Evented ??= emberSafeRequire('@ember/object/evented')?.default;
  MutableArray ??= emberSafeRequire('@ember/array/mutable')?.default;
  MutableEnumerable ??= emberSafeRequire('@ember/enumerable/mutable')?.default;
  Namespace ??= emberSafeRequire('@ember/application/namespace')?.default;
  NativeArray ??= emberSafeRequire('@ember/array')?.NativeArray;
  ObjectProxy ??= emberSafeRequire('@ember/object/proxy')?.default;
  Observable ??= emberSafeRequire('@ember/object/observable')?.default;
  PromiseProxyMixin ??= emberSafeRequire(
    '@ember/object/promise-proxy-mixin',
  )?.default;
  Service ??= emberSafeRequire('@ember/service')?.default;
  VERSION ??= emberSafeRequire('ember/version')?.default;
  captureRenderTree ??= emberSafeRequire('@ember/debug')?.captureRenderTree;
  get ??= emberSafeRequire('@ember/object')?.get;
  getEnv ??= emberSafeRequire('@ember/-internals/environment')?.getENV;
  meta ??= emberSafeRequire('@ember/-internals/meta')?.meta;
  set ??= emberSafeRequire('@ember/object')?.set;
}

getOwner = Owner ? Owner.getOwner : ApplicationModule?.getOwner;

export {
  ActionHandler,
  Application,
  ArrayProxy,
  Component,
  ComputedProperty,
  ControllerMixin,
  CoreObject,
  Debug,
  EmberDestroyable,
  EmberObject,
  Evented,
  GlimmerComponent,
  GlimmerManager,
  GlimmerReference,
  GlimmerRuntime,
  GlimmerUtil,
  GlimmerValidator,
  Instrumentation,
  InternalsMetal,
  InternalsRuntime,
  InternalsUtils,
  InternalsViews,
  MutableArray,
  MutableEnumerable,
  Namespace,
  NativeArray,
  ObjectInternals,
  ObjectProxy,
  Observable,
  PromiseProxyMixin,
  RSVP,
  Runloop,
  Service,
  VERSION,
  cacheFor,
  captureRenderTree,
  computed,
  get,
  getEnv,
  getOwner,
  guidFor,
  inspect,
  libraries,
  meta,
  set,
  subscribe,
};
