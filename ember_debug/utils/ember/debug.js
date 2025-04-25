import Ember, { Debug, InternalsUtils } from '../ember';

let module;
export let inspect;

if (Debug) {
  module = Debug;
  inspect = Debug.inspect || InternalsUtils.inspect;
} else {
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
