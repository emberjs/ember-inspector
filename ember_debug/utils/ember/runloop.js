import Ember, { Runloop as EmberRunloop } from '../ember';
import * as runloop from './own-runloop';

let module = runloop;
let _backburner = runloop._backburner;

const keys = ['cancel', 'debounce', 'join', 'later', 'scheduleOnce'];

if (EmberRunloop) {
  _backburner = EmberRunloop._backburner;
} else {
  // eslint-disable-next-line ember/new-module-imports
  _backburner = Ember?.run?.backburner || module._backburner;
  // eslint-disable-next-line ember/new-module-imports
  module = Ember?.run || module;
}

if (!keys.every((k) => k in module)) {
  module = runloop;
}

// if it is our own, run a internal to trigger `end`
// required in object inspector & render debug
function loop() {
  _backburner.later('actions', loop, 300);
}

if (_backburner === runloop._backburner) {
  loop();
}

export let run = runloop.run;
export { _backburner };
export let { cancel, debounce, join, later, scheduleOnce } = module;
