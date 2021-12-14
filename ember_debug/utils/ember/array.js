import Ember from '../ember';

let module;

try {
  module = requireModule('@ember/array');
} catch {
  module = Ember;
}

export let { A } = module;
