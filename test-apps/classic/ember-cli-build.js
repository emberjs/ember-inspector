'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const path = require('path');
const fs = require('fs');
const { Funnel } = require('broccoli-funnel');

const testingDir = path.resolve(__dirname, '../../dist/testing');
const distDir = path.resolve(__dirname, '../../dist');
const testingFolderExists = fs.existsSync(testingDir);

module.exports = function (defaults) {
  defaults.project.name = () => 'test-app';
  const app = new EmberApp(defaults, {
    'ember-cli-babel': { enableTypeScriptTransform: true },
    trees: {
      tests: new Funnel(path.resolve(__dirname, '../tests')),
      public: new Funnel(testingFolderExists ? testingDir : distDir, {
        files: [
          'ember_debug.js',
          'background.js',
          'content-script.js',
          'panes-3-16-0',
        ],
      }),
    },
  });

  return app.toTree();
};
