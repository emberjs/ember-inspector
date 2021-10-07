import Ember from '..';

let PromiseProxyMixin;

try {
  PromiseProxyMixin = requireModule('@ember/object/promise-proxy-mixin')[
    'default'
  ];
} catch {
  PromiseProxyMixin = Ember.PromiseProxyMixin;
}

export default PromiseProxyMixin;
