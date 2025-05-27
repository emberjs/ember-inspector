import Ember, { Runloop } from '../ember';
import * as runloop from './own-runloop';

// it could happen that runloop is available but _backburner is not exported (dead code)
// then we need to use our own
let module = runloop;
let _backburner = module._backburner;

if (Runloop?._backburner) {
  module = Runloop;
  _backburner = module._backburner;
  // eslint-disable-next-line ember/new-module-imports
} else if (Ember?.run?.backburner) {
  // eslint-disable-next-line ember/new-module-imports
  module = Ember?.run;
  _backburner = module.backburner;
}

const keys = ['cancel', 'debounce', 'join', 'later', 'scheduleOnce'];

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
