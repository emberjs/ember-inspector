import { emberSafeRequire } from 'ember-debug/utils/ember/loader';

let Ember;

try {
  Ember = requireModule('ember').default;
} catch {
  Ember = window.Ember;
}

let {
  ArrayProxy: EmberArrayProxy,
  Namespace: EmberNamespace,
  ActionHandler: EmberActionHandler,
  ControllerMixin: EmberControllerMixin,
  CoreObject: EmberCoreObject,
  Application: EmberApplication,
  MutableArray: EmberMutableArray,
  MutableEnumerable: EmberMutableEnumerable,
  NativeArray: EmberNativeArray,
  Component: EmberComponent,
  Observable: EmberObservable,
  Evented: EmberEvented,
  PromiseProxyMixin: EmberPromiseProxyMixin,
  Service: EmberService,
  Object: InternalEmberObject,
  ObjectProxy: EmberObjectProxy,
  VERSION: EmberVERSION,
  ComputedProperty: EmberComputedProperty,
  meta: Embermeta,
  get: Emberget,
  set: Emberset,
  computed: Embercomputed,
  _captureRenderTree: EmbercaptureRenderTree,
} = Ember || {};

let getEnv = () => Ember.ENV;

if (!Ember) {
  EmbercaptureRenderTree = emberSafeRequire('@ember/debug')?.captureRenderTree;
  getEnv = emberSafeRequire('@ember/-internals/environment')?.getENV;
  EmberArrayProxy = emberSafeRequire('@ember/array/proxy')?.default;
  EmberObjectProxy = emberSafeRequire('@ember/object/proxy')?.default;
  EmberMutableArray = emberSafeRequire('@ember/array/mutable')?.default;
  EmberNamespace = emberSafeRequire('@ember/application/namespace')?.default;
  EmberMutableEnumerable = emberSafeRequire(
    '@ember/enumerable/mutable',
  )?.default;
  EmberNativeArray = emberSafeRequire('@ember/array')?.NativeArray;
  EmberControllerMixin = emberSafeRequire('@ember/controller')?.ControllerMixin;
  EmberCoreObject = emberSafeRequire('@ember/object/core')?.default;
  EmberApplication = emberSafeRequire('@ember/application')?.default;
  EmberComponent = emberSafeRequire('@ember/component')?.default;
  EmberObservable = emberSafeRequire('@ember/object/observable')?.default;
  EmberEvented = emberSafeRequire('@ember/object/evented')?.default;
  EmberPromiseProxyMixin = emberSafeRequire(
    '@ember/object/promise-proxy-mixin',
  )?.default;
  EmberService = emberSafeRequire('@ember/service')?.default;
  InternalEmberObject = emberSafeRequire('@ember/object')?.default;
  EmberVERSION = emberSafeRequire('ember/version')?.default;
  EmberComputedProperty = emberSafeRequire(
    '@ember/-internals/metal',
  )?.ComputedProperty;
  Embermeta = emberSafeRequire('@ember/-internals/meta')?.meta;
  Emberset = emberSafeRequire('@ember/object')?.set;
  Emberget = emberSafeRequire('@ember/object')?.get;
}

export {
  EmberArrayProxy as ArrayProxy,
  EmberNamespace as Namespace,
  EmberActionHandler as ActionHandler,
  EmberApplication as Application,
  EmberControllerMixin as ControllerMixin,
  EmberMutableArray as MutableArray,
  EmberMutableEnumerable as MutableEnumerable,
  EmberNativeArray as NativeArray,
  EmberCoreObject as CoreObject,
  EmberObjectProxy as ObjectProxy,
  EmberComponent as Component,
  EmberObservable as Observable,
  EmberEvented as Evented,
  EmberService as Service,
  EmberPromiseProxyMixin as PromiseProxyMixin,
  InternalEmberObject as EmberObject,
  EmberVERSION as VERSION,
  EmberComputedProperty as ComputedProperty,
  Embermeta as meta,
  Embercomputed as computed,
  Emberget as get,
  Emberset as set,
  EmbercaptureRenderTree as captureRenderTree,
  getEnv as getEnv,
};

export default Ember;
