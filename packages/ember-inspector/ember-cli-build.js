'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { compatBuild } = require('@embroider/compat');

const options = {
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

module.exports = async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');

  const app = new EmberApp(defaults, options);

  return compatBuild(app, buildOnce);
};
