import { emberSafeRequire } from 'ember-debug/utils/ember/loader';

let Ember;

try {
  Ember = requireModule('ember').default;
} catch {
  Ember = window.Ember;
}

let {
  ArrayProxy,
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
  Object: EmberObject,
  ObjectProxy,
  VERSION,
  ComputedProperty,
  meta,
  get,
  set,
  computed,
  _captureRenderTree: captureRenderTree,
} = Ember || {};

let getEnv = () => Ember.ENV;

if (!Ember) {
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

let Debug = emberSafeRequire('@ember/debug')?.default;
let InternalsMetal = emberSafeRequire('@ember/-internals/metal')?.default;
let InternalsUtils = emberSafeRequire('@ember/-internals/utils')?.default;
let EmberDestroyable = emberSafeRequire('@ember/destroyable')?.default;
let ObjectInternals = emberSafeRequire('@ember/object/internals')?.default;
let Instrumentation = emberSafeRequire('@ember/instrumentation')?.default;

let RSVP = emberSafeRequire('rsvp')?.default;
let GlimmerManager = emberSafeRequire('@glimmer/manager')?.default;
let GlimmerReference = emberSafeRequire('@glimmer/reference')?.default;
let GlimmerRuntime = emberSafeRequire('@glimmer/runtime')?.default;
let GlimmerUtil = emberSafeRequire('@glimmer/util')?.default;

// this is for versions of ember not using requirejs or a global
if (!captureRenderTree) {
  const internalEmberModules = await globalThis.emberInspectorLoader.load();

  Debug = internalEmberModules.Debug;
  InternalsMetal = internalEmberModules.InternalsMetal;
  InternalsUtils = internalEmberModules.InternalsUtils;
  ObjectInternals = internalEmberModules.ObjectInternals;
  Instrumentation = internalEmberModules.Instrumentation;
  captureRenderTree = internalEmberModules.Debug.captureRenderTree;
  getEnv = internalEmberModules.InternalsEnvironment.getENV;
  ArrayProxy = internalEmberModules.ArrayProxy.default;
  ObjectProxy = internalEmberModules.ObjectProxy.default;
  MutableArray = internalEmberModules.ArrayMutable.default;
  Namespace = internalEmberModules.ApplicationNamespace.default;
  MutableEnumerable = internalEmberModules.EnumerableMutable.default;
  NativeArray = internalEmberModules.Array.NativeArray;
  ControllerMixin = internalEmberModules.Controller.ControllerMixin;
  CoreObject = internalEmberModules.ObjectCore.default;
  Application = internalEmberModules.Application.default;
  Component = internalEmberModules.Component.default;
  Observable = internalEmberModules.ObjectObservable.default;
  Evented = internalEmberModules.ObjectEvented.default;
  PromiseProxyMixin = internalEmberModules.ObjectPromiseProxyMixin.default;
  Service = internalEmberModules.Service.default;
  EmberDestroyable = internalEmberModules.EmberDestroyable;
  EmberObject = internalEmberModules.Object.default;
  VERSION = internalEmberModules.VERSION.default;
  ComputedProperty = internalEmberModules.InternalsMetal.ComputedProperty;
  meta = internalEmberModules.InternalsMeta?.meta;
  set = internalEmberModules.Object.set;
  get = internalEmberModules.Object.get;

  RSVP = internalEmberModules.RSVP;
  GlimmerManager = internalEmberModules.GlimmerManager;
  GlimmerReference = internalEmberModules.GlimmerReference;
  GlimmerRuntime = internalEmberModules.GlimmerRuntime;
  GlimmerUtil = internalEmberModules.GlimmerUtil;
}

export {
  Debug,
  InternalsMetal,
  InternalsUtils,
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
  EmberObject,
  EmberDestroyable,
  VERSION,
  ComputedProperty,
  meta,
  computed,
  get,
  set,
  captureRenderTree,
  getEnv,
  GlimmerManager,
  GlimmerReference,
  GlimmerRuntime,
  GlimmerUtil,
};

export default Ember;
