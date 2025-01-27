'use strict';

const getChannelURL = require('ember-source-channel-url');

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
      {
        name: 'ember-default-no-prototype-extensions',
        env: {
          NO_EXTEND_PROTOTYPES: 'true',
        },
      },
    ],
  };
};
