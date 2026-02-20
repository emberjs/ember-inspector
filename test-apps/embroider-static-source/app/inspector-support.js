// this is to support ember > 6

import Ember from 'ember';
import * as runtime from '@glimmer/runtime';
import * as tracking from '@glimmer/tracking';
import * as validator from '@glimmer/validator';
import { RSVP } from '@ember/-internals/runtime';
import * as metal from '@ember/-internals/metal';
import * as runloop from '@ember/runloop';

import config from 'test-app/config/environment';

// eslint-disable-next-line ember/new-module-imports
if (Ember.VERSION?.startsWith('6')) {
  window.define('@glimmer/tracking', () => tracking);
  window.define('@glimmer/runtime', () => runtime);
  window.define('@ember/-internals/metal', () => metal);
  window.define('@glimmer/validator', () => validator);
  window.define('@ember/runloop', () => runloop);
  window.define('rsvp', () => RSVP);
  window.define('ember', () => ({ default: Ember }));
  window.define('test-app/config/environment', () => ({
    default: config,
  }));
  document.dispatchEvent(new Event('Ember'));
}
