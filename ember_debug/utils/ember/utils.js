import Ember from '.';

let module;

try {
  module = requireModule('@ember/utils');
} catch {
  module = Ember;
}

export let { isNone } = module;
