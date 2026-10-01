'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { setConfig } = require('@warp-drive/core/build-config');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
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
