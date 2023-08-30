import { emberSafeRequire } from 'ember-debug/utils/ember/loader';

let Ember;

try {
  Ember = requireModule('ember').default;
} catch {
  Ember = window.Ember;
}

let {
  MutableArray,
  Component,
  Observable,
  Evented,
  PromiseProxyMixin,
  Object: EmberObject,
  VERSION,
  ComputedProperty,
  meta,
} = Ember || {};

if (!Ember) {
  MutableArray = emberSafeRequire('@ember/array/mutable')?.default;
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
}

export {
  MutableArray,
  Component,
  Observable,
  Evented,
  PromiseProxyMixin,
  EmberObject,
  VERSION,
  ComputedProperty,
  meta,
};

export default Ember;
