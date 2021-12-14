import Ember from '../../ember';

let module;

try {
  module = requireModule('@ember/object/computed');
} catch {
  module = Ember.computed;
}

export let { alias, equal, oneWay, or, reads, readOnly } = module;
