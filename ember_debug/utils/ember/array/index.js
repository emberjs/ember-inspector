import Ember from '..';

let module;

try {
  module = requireModule('@ember/array');
} catch {
  module = Ember;
}

export let { A } = module;
