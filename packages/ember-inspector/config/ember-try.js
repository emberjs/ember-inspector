/* eslint-disable n/no-unpublished-require */

'use strict';

const getChannelURL = require('ember-source-channel-url');

// The dependencies that the app needs for Ember 7 and later.
// A `null` removes an addon that has no release for Ember 7.
const ember7 = {
  '@ember/legacy-built-in-components': null,
  '@ember/test-helpers': '^5.4.2',
  '@glimmer/component': '^2.1.1',
  '@html-next/vertical-collection': '^5.0.5',
  'ember-cli': '~7.0.0',
  'ember-cli-deprecation-workflow': '^4.0.1',
  'ember-cli-htmlbars': '^7.0.1',
  'ember-concurrency': '^5.3.0',
  'ember-flatpickr': '^9.0.2',
  'ember-in-element-polyfill': null,
  'ember-on-resize-modifier': null,
  'ember-qunit': '^9.0.4',
  // tests/test-helper.js imports the waiter of this version.
  'ember-raf-scheduler': '^0.3.0',
  'ember-svg-jar': '^3.0.0',
  'ember-table': null,
  'ember-wormhole': null,
  'tracked-built-ins': '^4.1.2',
};

module.exports = async function () {
  return {
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-lts-3.16',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.4.0',
            'ember-cli': '^3.28.0',
            'ember-cli-app-version': '^5.0.0',
            'ember-source': '~3.16.0',
            'ember-resolver': '^11.0.1',
            'ember-qunit': '^5.1.5',
          },
        },
      },
      {
        name: 'ember-lts-3.20',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.4.0',
            'ember-cli': '^3.28.0',
            'ember-cli-app-version': '^5.0.0',
            'ember-source': '~3.20.5',
            'ember-resolver': '^11.0.1',
            'ember-qunit': '^5.1.5',
          },
        },
      },
      {
        name: 'ember-lts-3.24',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.4.0',
            'ember-cli': '^3.28.0',
            'ember-cli-app-version': '^5.0.0',
            'ember-source': '~3.24.0',
            'ember-resolver': '^11.0.1',
            'ember-qunit': '^5.1.5',
          },
        },
      },
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.4.0',
            'ember-cli': '^3.28.0',
            'ember-cli-app-version': '^6.0.0',
            'ember-source': '~3.28.0',
            'ember-resolver': '^11.0.1',
            'ember-qunit': '^5.1.5',
          },
        },
      },
      {
        name: 'ember-lts-4.8',
        npm: {
          devDependencies: {
            'ember-resolver': '^11.0.1',
            'ember-source': '~4.8.0',
          },
        },
      },
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: {
            'ember-source': '~4.12.0',
          },
        },
      },
      {
        name: 'ember-lts-5.4',
        npm: {
          devDependencies: {
            'ember-source': '~5.4.0',
          },
        },
      },
      {
        name: 'ember-lts-5.8',
        npm: {
          devDependencies: {
            'ember-source': '~5.8.0',
          },
        },
      },
      {
        name: 'ember-lts-5.12',
        npm: {
          devDependencies: {
            'ember-source': '~5.12.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            ...ember7,
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            ...ember7,
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            ...ember7,
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
      {
        name: 'ember-default',
        npm: {
          devDependencies: {},
        },
      },
      {
        name: 'ember-default-no-prototype-extensions',
        env: {
          NO_EXTEND_PROTOTYPES: 'true',
        },
      },
    ],
  };
};
