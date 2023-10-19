import { emberSafeRequire } from 'ember-debug/utils/ember/loader';

let Ember;

try {
  Ember = requireModule('ember').default;
} catch {
  Ember = window.Ember;
}

let {
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
  Object: EmberObject,
  VERSION,
  ComputedProperty,
  meta,
  get,
  set,
  computed,
} = Ember || {};

if (!Ember) {
  MutableArray = emberSafeRequire('@ember/array/mutable')?.default;
  Namespace = emberSafeRequire('@ember/application/namespace')?.default;
  MutableEnumerable = emberSafeRequire(
    '@ember/enumerable/mutable'
  )?.NativeArray;
  CoreObject = emberSafeRequire('@ember/array')?.NativeArray;
  ControllerMixin = emberSafeRequire('@ember/controller')?.ControllerMixin;
  NativeArray = emberSafeRequire('@ember/object/core')?.NativeArray;
  Application = emberSafeRequire('@ember/application')?.default;
  Component = emberSafeRequire('@ember/component')?.default;
  Observable = emberSafeRequire('@ember/object/observable')?.default;
  Evented = emberSafeRequire('@ember/object/evented')?.default;
  PromiseProxyMixin = emberSafeRequire(
    '@ember/object/promise-proxy-mixin'
  )?.default;
  EmberObject = emberSafeRequire('@ember/object')?.default;
  VERSION = emberSafeRequire('ember/version')?.default;
  ComputedProperty = emberSafeRequire(
    '@ember/-internals/metal'
  )?.ComputedProperty;
  meta = emberSafeRequire('@ember/-internals/meta')?.meta;
  computed = emberSafeRequire('@ember/object/computed')?.default;
  set = emberSafeRequire('@ember/object')?.set;
  get = emberSafeRequire('@ember/object')?.get;
}

export {
  Namespace,
  ActionHandler,
  Application,
  ControllerMixin,
  MutableArray,
  MutableEnumerable,
  NativeArray,
  CoreObject,
  Component,
  Observable,
  Evented,
  PromiseProxyMixin,
  EmberObject,
  VERSION,
  ComputedProperty,
  meta,
  computed,
  get,
  set,
};

export default Ember;
