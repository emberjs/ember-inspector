import { assert } from '@ember/debug';

const config = {
  modulePrefix: 'vite-test-app',
  rootURL: '/',
  locationType: 'none',
  EmberENV: {
    EXTEND_PROTOTYPES: false,
    FEATURES: {
      // Here you can enable experimental features on an ember canary build
      // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
    },
  },

  APP: {
    // Here you can pass flags/options to your application instance
    // when it is created
  },
};

assert(
  'config is not an object',
  typeof config === 'object' && config !== null,
);
assert(
  'modulePrefix was not detected on your config',
  'modulePrefix' in config && typeof config.modulePrefix === 'string',
);
assert(
  'locationType was not detected on your config',
  'locationType' in config && typeof config.locationType === 'string',
);
assert(
  'rootURL was not detected on your config',
  'rootURL' in config && typeof config.rootURL === 'string',
);
assert(
  'APP was not detected on your config',
  'APP' in config && typeof config.APP === 'object',
);

export default config;
