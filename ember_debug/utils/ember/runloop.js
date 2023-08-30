import Ember from '../ember';
import * as runloop from '@ember/runloop';

let module = runloop;

export let run = runloop.run;
export let _backburner;

try {
  module = requireModule('@ember/runloop');
  // it could happen that runloop is available but _backburner is not exported (dead code)
  // then we need to use our own
  _backburner = module._backburner || runloop._backburner;
} catch {
  _backburner = Ember?.run?.backburner || runloop._backburner;
}

// if it is our own, run a internal to trigger `end`
// required in object inspector & render debug
if (_backburner === runloop._backburner) {
  _backburner.later(() => {}, 300);
}

export let { cancel, debounce, join, later, scheduleOnce } = module;
