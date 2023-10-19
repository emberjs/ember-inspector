import Ember from '../ember';

let module;

export let inspect;

try {
  module = requireModule('@ember/debug');
  inspect = module.inspect || requireModule('@ember/-internals/utils').inspect;
} catch {
  module = Ember.Debug;
  inspect = Ember.inspect;
}

if (!inspect) {
  inspect = Ember.inspect;
}

export let { registerDeprecationHandler } = module;
export default module;
