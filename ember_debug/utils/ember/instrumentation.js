import Ember, { Instrumentation } from '../ember';

let module;

if (Instrumentation) {
  module = Instrumentation;
} else {
  module = Ember;
}

export let { subscribe } = module;
