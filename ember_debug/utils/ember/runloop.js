import Ember from '../ember';

let module;

export let run;
export let _backburner;

try {
  module = requireModule('@ember/runloop');
  run = module.run;
  _backburner = module._backburner;
} catch {
  module = run = Ember.run;
  _backburner = Ember.run.backburner;
}

export let { cancel, debounce, join, later, scheduleOnce } = module;
