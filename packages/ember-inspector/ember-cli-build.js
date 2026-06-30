'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const replace = require('broccoli-string-replace');
const packageJson = require('./package.json');

const options = {
  autoImport: {
    forbidEval: true,
  },
  fingerprint: {
    enabled: false,
  },
  svgJar: {
    sourceDirs: ['public/assets/svg'],
  },
  // Firefox requires non-minified assets for review :(
  minifyJS: {
    enabled: false,
  },
  minifyCSS: {
    enabled: false,
  },
  vendorFiles: {
    'jquery.js': null,
  },
};

module.exports = function (defaults) {
  if (process.env.EMBER_ENV !== 'test') {
    // https://github.com/ef4/ember-auto-import/issues/540
    options.autoImport.publicAssetURL = 'assets/';
  }

  const app = new EmberApp(defaults, options);

  app.import('vendor/babel-polyfill.js', { prepend: true });
  app.import('node_modules/basiccontext/dist/basicContext.min.css');
  app.import('node_modules/basiccontext/dist/themes/default.min.css');
  app.import('node_modules/basiccontext/dist/basicContext.min.js');
  app.import('node_modules/normalize.css/normalize.css');

  let tree = app.toTree();

  tree = replace(tree, {
    files: ['**/*.js'],
    patterns: [
      {
        match: /{{EMBER_INSPECTOR_VERSION}}/g,
        replacement: packageJson.version,
      },
    ],
  });

  if (
    process.env.EMBER_ENV === 'test' ||
    process.env.EMBER_ENV === 'development'
  ) {
    tree = replace(tree, {
      files: ['**/*.js'],
      patterns: [
        {
          match: /{{EMBER_DIST}}/g,
          replacement:
            process.env.EMBER_ENV === 'test' ? 'basic' : 'bookmarklet',
        },
      ],
    });
  }

  return tree;
};
