'use strict';

let packageJson = require('../package.json');

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'ember-inspector',
    environment,
    rootURL: '',
    locationType: 'hash',
    emberVersionsSupported: packageJson.emberVersionsSupported,
    previousEmberVersionsSupported: packageJson.previousEmberVersionsSupported,
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_MODULE_UNIFICATION: true
        EMBER_METAL_TRACKED_PROPERTIES: true
      },
      EXTEND_PROTOTYPES: process.env.NO_EXTEND_PROTOTYPES ? false : {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';
    ENV.rootURL = '/testing/';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // Intentionally empty
  }

  return ENV;
};
