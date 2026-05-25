import loadConfigFromMeta from '@embroider/config-meta-loader';
import { assert } from '@ember/debug';

// const config = loadConfigFromMeta('ember-inspector');

// // todo make this dynamic
// const packageJson = {
//   "version": "4.17.0",
//   "emberVersionsSupported": [
//     "3.16.0",
//     ""
//   ],
//   "previousEmberVersionsSupported": [
//     "0.0.0",
//     "2.7.0",
//     "3.4.0"
//   ],
// }

// const config = {
//   modulePrefix: 'ember-inspector',
//   locationType: 'hash',
//   rootURL: '',
//   version: packageJson.version,
//   emberVersionsSupported: packageJson.emberVersionsSupported,
//   previousEmberVersionsSupported: packageJson.previousEmberVersionsSupported,
//   APP: {
//     audoBoot: true
//   }
// };

import pkg from '../../package.json';

const config = {
  modulePrefix: 'ember-inspector',
  environment: 'development',
  rootURL: '',
  locationType: 'hash',
  version: '4.17.0',
  emberVersionsSupported: ['3.16.0', ''],
  previousEmberVersionsSupported: ['0.0.0', '2.7.0', '3.4.0'],
  EmberENV: {
    EXTEND_PROTOTYPES: false,
    FEATURES: {},
    _APPLICATION_TEMPLATE_WRAPPER: false,
    _DEFAULT_ASYNC_OBSERVERS: true,
    _JQUERY_INTEGRATION: false,
    _NO_IMPLICIT_ROUTE_MODEL: true,
    _TEMPLATE_ONLY_GLIMMER_COMPONENTS: true,
  },
  APP: {
    // rootElement: '#ember-inspector'
  },
  VERSION: pkg.version,
};

assert(
  'config is not an object',
  typeof config === 'object' && config !== null
);
assert(
  'modulePrefix was not detected on your config',
  'modulePrefix' in config && typeof config.modulePrefix === 'string'
);
assert(
  'locationType was not detected on your config',
  'locationType' in config && typeof config.locationType === 'string'
);
assert(
  'rootURL was not detected on your config',
  'rootURL' in config && typeof config.rootURL === 'string'
);
assert(
  'APP was not detected on your config',
  'APP' in config && typeof config.APP === 'object'
);

export default config;
