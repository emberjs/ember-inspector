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
  meta,
  get,
  set,
  runloop,
  computed,
  _metal: metal,
  _captureRenderTree: captureRenderTree,
  inspect,
  getOwner,
} = Ember || {};

let getEnv = () => Ember.ENV;
let cacheFor = () => null;

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
    '@ember/object/promise-proxy-mixin'
  )?.default;
  Service = emberSafeRequire('@ember/service')?.default;
  EmberObject = emberSafeRequire('@ember/object')?.default;
  VERSION = emberSafeRequire('ember/version')?.default;
  metal = emberSafeRequire(
    '@ember/-internals/metal'
  );
  meta = emberSafeRequire('@ember/-internals/meta')?.meta;
  set = emberSafeRequire('@ember/object')?.set;
  get = emberSafeRequire('@ember/object')?.get;
  runloop = emberSafeRequire('@ember/runloop');
  cacheFor = emberSafeRequire('@ember/object/internals').cacheFor;
  guidFor = emberSafeRequire('@ember/object/internals').guidFor;
  getOwner = emberSafeRequire('@ember/owner').getOwner;
  inspect = emberSafeRequire('@ember/debug').inspect;
}

const { ComputedProperty, isComputed, descriptorForProperty, descriptorForDecorator, tagForProperty } = metal;
const { _backburner, cancel, debounce, join, later, scheduleOnce } = runloop;
export const ember =  {
  runloop: {
    _backburner, cancel, debounce, join, later, scheduleOnce
  },
  object: {
    cacheFor,
    guidFor,
    getOwner,
    set,
    get,
    meta
  },
  debug: {
    isComputed,
    isTrackedProperty,
    isCachedProperty,
    descriptorForProperty,
    descriptorForDecorator,
    isMandatorySetter,
    meta,
    captureRenderTree,
    isTesting,
    inspect,
    registerDeprecationHandler,
    tagForProperty,
    ComputedProperty,
  },
  classes: {
    EmberObject,
    MutableArray,
    Namespace,
    MutableEnumerable,
    NativeArray,
    TargetActionSupport,
    ControllerMixin,
    CoreObject,
    Application,
    EmberComponent,
    GlimmerComponent,
    Observable,
    Evented,
    PromiseProxyMixin,
  },
  VERSION,
  instrumentation: {
    subscribe
  },
  Views: {
    ViewStateSupport,
    ViewMixin,
    ActionSupport,
    ClassNamesSupport,
    ChildViewsSupport,
    CoreView
  },
  GlimmerValidator,
  GlimmerRuntime,
  RSVP,
  getEnv
}

export default Ember;
