/* eslint-disable ember/new-module-imports */
import { emberSafeRequire } from 'ember-debug/utils/ember/loader';

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

let ArrayProxy = Ember.ArrayProxy;
let Namespace = Ember.Namespace;
let ActionHandler = Ember.ActionHandler;
let ControllerMixin = Ember.ControllerMixin;
let CoreObject = Ember.CoreObject;
let Application = Ember.Application;
let MutableArray = Ember.MutableArray;
let MutableEnumerable = Ember.MutableEnumerable;
let NativeArray = Ember.NativeArray;
let Component = Ember.Component;
let Observable = Ember.Observable;
let Evented = Ember.Evented;
let PromiseProxyMixin = Ember.PromiseProxyMixin;
let Service = Ember.Service;
let ObjectProxy = Ember.ObjectProxy;
let VERSION = Ember.VERSION;
let ComputedProperty = Ember.ComputedProperty;
let meta = Ember.meta;
let get = Ember.get;
let set = Ember.set;
let computed = Ember.computed;
let EmberObject = Ember.Object;
let captureRenderTree = Ember._captureRenderTree;

let getEnv = () => Ember.ENV;

let Debug = emberSafeRequire('@ember/debug')?.default;
let InternalsUtils = emberSafeRequire('@ember/-internals/utils')?.default;
let ObjectInternals = emberSafeRequire('@ember/object/internals')?.default;
let Instrumentation = emberSafeRequire('@ember/instrumentation')?.default;
let RSVP = emberSafeRequire('rsvp')?.default;
let Runloop = emberSafeRequire('@ember/runloop')?.default;

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

export {
  Runloop,
  Debug,
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
  VERSION,
  ComputedProperty,
  meta,
  computed,
  get,
  set,
  captureRenderTree,
  getEnv,
};

export default Ember;
