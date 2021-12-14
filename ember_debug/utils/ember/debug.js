import Ember from '../ember';

let module;

export let inspect;

try {
  module = requireModule('@ember/debug');
  inspect = module.inspect;
} catch {
  module = Ember.Debug;
  inspect = Ember.inspect;
}

export let { registerDeprecationHandler } = module;
