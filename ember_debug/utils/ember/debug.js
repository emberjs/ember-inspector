import Ember from '../ember';

let module;

export let inspect;

try {
  module = requireModule('@ember/debug');
  inspect = module.inspect || requireModule('@ember/-internals/utils').inspect;
} catch {
  module = Ember.Debug;
  // eslint-disable-next-line ember/new-module-imports
  inspect = Ember.inspect;
}

if (!inspect) {
  // eslint-disable-next-line ember/new-module-imports
  inspect = Ember.inspect;
}

export let { registerDeprecationHandler } = module;
export default module;
