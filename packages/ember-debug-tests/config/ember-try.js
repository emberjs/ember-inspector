'use strict';

const getChannelURL = require('ember-source-channel-url');

// The default dependencies are for Ember 7 and later.
// These are the dependencies for Ember 6 and earlier.
const beforeEmber7 = {
  '@ember/render-modifiers': '^2.1.0',
  '@ember/test-helpers': '^4.0.4',
  '@glimmer/component': '^1.1.2',
  'ember-cli': '~6.1.0',
  'ember-cli-htmlbars': '^6.3.0',
  'ember-qunit': '^8.1.1',
};

// These are the dependencies for Ember 3.
const ember3 = {
  ...beforeEmber7,
  '@ember/test-helpers': '^2.4.0',
  'ember-cli': '^3.28.0',
  // Ember before 3.20 has no `{{in-element}}`.
  'ember-in-element-polyfill': '^1.0.1',
  'ember-resolver': '^11.0.1',
  'ember-qunit': '^5.1.5',
};

module.exports = async function () {
  return {
    usePnpm: true,
    // CI downloads a build of ember-debug, so the install must not
    // rebuild it with the `prepare` script.
    buildManagerOptions() {
      return process.env.CI
        ? ['--no-lockfile', '--ignore-scripts']
        : ['--no-lockfile'];
    },
    scenarios: [
      {
        name: 'ember-lts-3.16',
        npm: {
          devDependencies: { ...ember3, 'ember-source': '~3.16.0' },
        },
      },
      {
        name: 'ember-lts-3.20',
        npm: {
          devDependencies: { ...ember3, 'ember-source': '~3.20.5' },
        },
      },
      {
        name: 'ember-lts-3.24',
        npm: {
          devDependencies: { ...ember3, 'ember-source': '~3.24.0' },
        },
      },
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: { ...ember3, 'ember-source': '~3.28.0' },
        },
      },
      {
        name: 'ember-lts-4.8',
        npm: {
          devDependencies: {
            ...beforeEmber7,
            'ember-resolver': '^11.0.1',
            'ember-source': '~4.8.0',
          },
        },
      },
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: { ...beforeEmber7, 'ember-source': '~4.12.0' },
        },
      },
      {
        name: 'ember-lts-5.4',
        npm: {
          devDependencies: { ...beforeEmber7, 'ember-source': '~5.4.0' },
        },
      },
      {
        name: 'ember-lts-5.8',
        npm: {
          devDependencies: { ...beforeEmber7, 'ember-source': '~5.8.0' },
        },
      },
      {
        name: 'ember-lts-5.12',
        npm: {
          devDependencies: { ...beforeEmber7, 'ember-source': '~5.12.0' },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
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
    ],
  };
};
