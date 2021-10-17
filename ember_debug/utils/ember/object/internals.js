import Ember from '..';

let module;

try {
  module = requireModule('@ember/object/internals');
} catch {
  module = Ember;
}

export let { cacheFor, guidFor } = module;
