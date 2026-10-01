'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { setConfig } = require('@warp-drive/core/build-config');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    trees: {
      tests: mergeTrees([
        'tests',
        new Funnel('../ember-inspector/tests', {
          include: ['ember_debug/**', 'helpers/setup-ember-debug-test.js'],
        }),
      ]),
    },
  });

  setConfig(app, __dirname, {
    // this should be the most recent <major>.<minor> version for
    // which all deprecations have been fully resolved
    // and should be updated when that changes
    compatWith: '5.8',
    deprecations: {
      // ... list individual deprecations that have been resolved here
    },
  });

  return app.toTree();
};
