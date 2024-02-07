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
  _captureRenderTree: captureRenderTree,
  ControllerMixin,
  CoreObject,
  Application,
  MutableArray,
  MutableEnumerable,
  NativeArray,
  Component: EmberComponent,
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
  cacheFor,
  metal,
  guidFor,
  getOwner,
  isTrackedProperty,
  isCachedProperty,
  isMandatorySetter,
  isTesting,
  inspect,
  registerDeprecationHandler,
  TargetActionSupport,
  GlimmerComponent,
  instrumentation,
  RSVP,
} = Ember || {};

let getEnv = () => Ember.ENV;
let cacheFor = () => null;

if (!Ember) {
  MutableArray = emberSafeRequire('@ember/array/mutable')?.default;
  Namespace = emberSafeRequire('@ember/application/namespace')?.default;
  MutableEnumerable = emberSafeRequire('@ember/enumerable/mutable')?.default;
  NativeArray = emberSafeRequire('@ember/array')?.NativeArray;
  ControllerMixin = emberSafeRequire('@ember/controller')?.ControllerMixin;
  CoreObject = emberSafeRequire('@ember/object/core')?.default;
  Application = emberSafeRequire('@ember/application')?.default;
  EmberComponent = emberSafeRequire('@ember/component')?.default;
  GlimmerComponent = emberSafeRequire('@glimmer/component')?.default;
  Observable = emberSafeRequire('@ember/object/observable')?.default;
  Evented = emberSafeRequire('@ember/object/evented')?.default;
  PromiseProxyMixin = emberSafeRequire(
    '@ember/object/promise-proxy-mixin'
  )?.default;
  EmberObject = emberSafeRequire('@ember/object')?.default;
  VERSION = emberSafeRequire('ember/version')?.default;
  metal = emberSafeRequire('@ember/-internals/metal');
  TargetActionSupport = emberSafeRequire(
    '@ember/-internals/runtime'
  )?.TargetActionSupport;
  meta = emberSafeRequire('@ember/-internals/meta')?.meta;
  set = emberSafeRequire('@ember/object')?.set;
  get = emberSafeRequire('@ember/object')?.get;
  runloop = emberSafeRequire('@ember/runloop');
  cacheFor = emberSafeRequire('@ember/object/internals')?.cacheFor;
  guidFor = emberSafeRequire('@ember/object/internals')?.guidFor;
  getOwner = emberSafeRequire('@ember/owner')?.getOwner;
  inspect =
    emberSafeRequire('@ember/debug')?.inspect ||
    emberSafeRequire('@ember/-internals/utils')?.inspect;
  registerDeprecationHandler =
    emberSafeRequire('@ember/debug')?.registerDeprecationHandler;
  instrumentation = emberSafeRequire('@ember/instrumentation');
  RSVP = emberSafeRequire('rsvp');
}

const {
  ComputedProperty,
  isComputed,
  descriptorForProperty,
  descriptorForDecorator,
  tagForProperty,
} = (metal || {});

const { _backburner, cancel, debounce, join, later, scheduleOnce } = (runloop || {});
const {
  ViewStateSupport,
  ViewMixin,
  ActionSupport,
  ClassNamesSupport,
  ChildViewsSupport,
  CoreView,
} = emberSafeRequire('@ember/-internals/views') || Ember || {};

const GlimmerValidator = emberSafeRequire('@glimmer/validator');
const GlimmerRuntime = emberSafeRequire('@glimmer/runtime');

export function assignEmberInfo(data) {
  Object.assign(ember, data);
}

export const ember = {
  runloop: {
    _backburner,
    cancel,
    debounce,
    join,
    later,
    scheduleOnce,
  },
  object: {
    cacheFor,
    guidFor,
    getOwner,
    set,
    get,
    meta,
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
  instrumentation: instrumentation,
  Views: {
    ViewStateSupport,
    ViewMixin,
    ActionSupport,
    ClassNamesSupport,
    ChildViewsSupport,
    CoreView,
  },
  GlimmerValidator,
  GlimmerRuntime,
  RSVP,
  getEnv,
};

export default Ember;
