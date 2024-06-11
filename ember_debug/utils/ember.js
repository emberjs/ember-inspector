import { emberSafeRequire } from 'ember-debug/utils/ember/loader';

let Ember;

try {
  Ember = requireModule('ember').default;
} catch {
  Ember = window.Ember;
}

let {
  libraries,
  ArrayProxy,
  ObjectProxy,
  ActionHandler,
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
  Service,
  PromiseProxyMixin,
  Object: EmberObject,
  VERSION,
  meta,
  get,
  set,
  runloop: runloop_,
  cacheFor,
  guidFor,
  getOwner,
  isTrackedProperty,
  isCachedProperty,
  isMandatorySetter,
  isTesting,
  inspect,
  Debug: { registerDeprecationHandler },
  TargetActionSupport,
  GlimmerComponent,
  Instrumentation: instrumentation_,
  RSVP,
  ENV: ENV_,
} = Ember || {};

let metal = emberSafeRequire('@ember/-internals/metal');
runloop_ = Ember?.runloop || Ember?.run;
runloop_.run = Ember?.run || runloop_.run;

if (metal) {
  ActionHandler = emberSafeRequire('@ember/-internals/runtime')?.ActionHandler;
  ObjectProxy = emberSafeRequire('@ember/object/proxy')?.default;
  ArrayProxy = emberSafeRequire('@ember/array/proxy')?.default;
  libraries = emberSafeRequire('@ember/-internals/metal')?.libraries;
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
  Service = emberSafeRequire('@ember/service')?.default;
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
  runloop_ = emberSafeRequire('@ember/runloop');
  cacheFor = emberSafeRequire('@ember/object/internals')?.cacheFor;
  guidFor = emberSafeRequire('@ember/object/internals')?.guidFor;
  getOwner = emberSafeRequire('@ember/owner')?.getOwner;
  inspect =
    emberSafeRequire('@ember/debug')?.inspect ||
    emberSafeRequire('@ember/-internals/utils')?.inspect;
  registerDeprecationHandler =
    emberSafeRequire('@ember/debug')?.registerDeprecationHandler;
  instrumentation_ = emberSafeRequire('@ember/instrumentation');
  RSVP = emberSafeRequire('rsvp');
  ENV_ = emberSafeRequire('@ember/-internals/environment')?.ENV;
}

const {
  ComputedProperty,
  isComputed,
  descriptorForProperty,
  descriptorForDecorator,
  tagForProperty,
  track,
} = metal || {};

const { _backburner, cancel, debounce, join, later, scheduleOnce, run } =
  runloop_ || {};
const {
  ViewStateSupport,
  ViewMixin,
  ActionSupport,
  ClassNamesSupport,
  ChildViewsSupport,
  CoreView,
} = emberSafeRequire('@ember/-internals/views') || Ember || {};

const GlimmerValidator_ = emberSafeRequire('@glimmer/validator') || {};
const GlimmerRuntime_ = emberSafeRequire('@glimmer/runtime') || {};

export function assignEmberInfo(data) {
  Object.assign(ember, data);
  Object.assign(utils, data.utils);
  Object.assign(runloop, data.runloop);
  Object.assign(object, data.object);
  Object.assign(debug, data.debug);
  Object.assign(classes, data.classes);
  Object.assign(glimmer, data.glimmer);
  Object.assign(Views, data.Views);
  Object.assign(instrumentation, data.instrumentation);
  Object.assign(ENV_, data.ENV);
}

export const utils = {
  libraries,
};

export const runloop = {
  _backburner,
  cancel,
  debounce,
  join,
  later,
  scheduleOnce,
  run,
};

export const object = {
  cacheFor,
  guidFor,
  getOwner,
  set,
  get,
  meta,
};

if (!isMandatorySetter) {
  isMandatorySetter = function (obj, prop) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    if (
      Ember.MANDATORY_SETTER_FUNCTION &&
      descriptor?.set === Ember.MANDATORY_SETTER_FUNCTION
    ) {
      return true;
    }
    if (
      descriptor?.set &&
      Function.prototype.toString
        .call(descriptor.set)
        .includes('You attempted to update')
    ) {
      return true;
    }
    return false;
  };
}

export const debug = {
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
  track,
  instrumentation: instrumentation_,
};

export const classes = {
  ArrayProxy,
  ObjectProxy,
  ActionHandler,
  ComputedProperty,
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
  Service,
  PromiseProxyMixin,
  RSVP,
};

export const Views = {
  ViewStateSupport,
  ViewMixin,
  ActionSupport,
  ClassNamesSupport,
  ChildViewsSupport,
  CoreView,
};

export const glimmer = {
  validator: GlimmerValidator_,
  runtime: GlimmerRuntime_,
};

export const instrumentation = instrumentation_;

export const ENV = ENV_;

export const ember = {
  runloop,
  object,
  debug,
  classes,
  VERSION,
  instrumentation: instrumentation_,
  Views,
  glimmer,
  env: ENV_,
};

export default ember;
