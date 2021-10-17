import Ember from '.';

let module;

try {
  module = requireModule('@ember/instrumentation');
} catch {
  module = Ember;
}

export let { subscribe } = module;
