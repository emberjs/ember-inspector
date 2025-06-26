'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const path = require('path');
const fs = require('fs');
const { Funnel } = require('broccoli-funnel');
const merge = require('broccoli-merge-trees');
const { compatBuild } = require('@embroider/compat');

const testingDir = path.resolve(__dirname, '../../dist/testing');
const distDir = path.resolve(__dirname, '../../dist');
const testingFolderExists = fs.existsSync(testingDir);

module.exports = function (defaults) {
  defaults.project.name = () => 'test-app';
  const app = new EmberApp(defaults, {
    'ember-cli-babel': { enableTypeScriptTransform: true },
    trees: {
      tests: new Funnel(path.resolve(__dirname, '../shared/tests')),
      app: merge(
        [new Funnel(path.resolve(__dirname, '../shared/app')), 'app'],
        {
          overwrite: true,
        },
      ),
      styles: new Funnel(path.resolve(__dirname, '../shared/app/styles')),
      templates: new Funnel(path.resolve(__dirname, '../shared/app/templates')),
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

  return compatBuild(app, require('@embroider/webpack').Webpack, {
    staticEmberSource: true,
  });
};
