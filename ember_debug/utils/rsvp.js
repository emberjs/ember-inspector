import Ember from './ember';

let module, RSVP;

try {
  module = requireModule('rsvp');
  RSVP = module.default;
} catch {
  module = RSVP = Ember.RSVP;
}

export let { Promise, all, resolve } = module;

export default RSVP;
