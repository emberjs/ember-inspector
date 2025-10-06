'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function () {
  return {
    packageManager: 'pnpm',
    // hack to override
    scenarios: [
      {
        name: 'ember-lts-3.16',
        command: 'pnpm run test-lts-3',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.4.0',
            'ember-cli': '^3.28.0',
            'ember-source': '~3.16.0',
            'ember-resolver': '^11.0.1',
            'ember-qunit': '^5.1.5',
          },
        },
      },
      {
        name: 'ember-lts-3.20',
        command: 'pnpm run test-lts-3',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.4.0',
            'ember-cli': '^3.28.0',
            'ember-source': '~3.20.5',
            'ember-resolver': '^11.0.1',
            'ember-qunit': '^5.1.5',
          },
        },
      },
      {
        name: 'ember-lts-3.24',
        command: 'pnpm run test-lts-3',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.4.0',
            'ember-cli': '^3.28.0',
            'ember-source': '~3.24.0',
            'ember-resolver': '^11.0.1',
            'ember-qunit': '^5.1.5',
          },
        },
      },
      {
        name: 'ember-lts-3.28',
        command: 'pnpm run test-lts-3',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.4.0',
            'ember-cli': '^3.28.0',
            'ember-source': '~3.28.0',
            'ember-resolver': '^11.0.1',
            'ember-qunit': '^5.1.5',
            'babel-plugin-ember-template-compilation': '^1.0.2',
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
