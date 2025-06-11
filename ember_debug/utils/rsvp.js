import Ember, { RSVP as emberRSVP } from './ember';

let module;

if (emberRSVP) {
  module = emberRSVP;
} else {
  // eslint-disable-next-line ember/new-module-imports
  module = Ember.RSVP;
}

export let { Promise, all, resolve } = module;

export default module;
