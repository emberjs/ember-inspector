import Ember, { RSVP as emberRSVP } from './ember';

let module, RSVP;

if (emberRSVP) {
  module = emberRSVP;
  RSVP = module.default;

  // The RSVP module should have named exports for `Promise`, etc,
  // but some old versions do not and provide `RSVP.Promise`, etc.
  if (!('Promise' in module)) {
    module = RSVP;
  }
} else {
  // eslint-disable-next-line ember/new-module-imports
  module = RSVP = Ember.RSVP;
}

export let { Promise, all, resolve } = module;

export default RSVP;
