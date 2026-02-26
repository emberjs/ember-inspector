import { Runloop as EmberRunloop } from '../ember.js';
import * as runloop from './own-runloop.js';

// it could happen that runloop is available but _backburner is not exported (dead code)
// then we need to use our own.
let module = runloop;
let _backburner = runloop._backburner;

const keys = ['cancel', 'debounce', 'join', 'later', 'scheduleOnce'];

if (EmberRunloop?._backburner || EmberRunloop?.backburner) {
  module = EmberRunloop;
  _backburner = EmberRunloop._backburner || EmberRunloop.backburner;
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
