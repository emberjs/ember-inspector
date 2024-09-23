import { runloop as EmberRunloop } from '../ember';
import * as runloop from './own-runloop';

let module = runloop;
let _backburner = runloop._backburner;

const keys = ['cancel', 'debounce', 'join', 'later', 'scheduleOnce'];

if (EmberRunloop?._backburner) {
  module = EmberRunloop;
  _backburner = EmberRunloop._backburner;
}

if (!keys.every((k) => k in module)) {
  module = runloop;
  _backburner = runloop._backburner;
}

// if it is our own, run a internal to trigger `end`
// required in object inspector & render debug
function loop() {
  _backburner.schedule('actions', loop, 300);
}

if (_backburner === runloop._backburner) {
  loop();
}

export { _backburner };
export let { cancel, debounce, join, later, scheduleOnce, run } = module;
