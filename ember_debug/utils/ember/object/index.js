import Ember from '..';

let module, EmberObject;

try {
  module = requireModule('@ember/object');
  EmberObject = module.default;
} catch {
  module = Ember;
  EmberObject = Ember.Object;
}

export let { computed, get, observer, set } = module;

export default EmberObject;
