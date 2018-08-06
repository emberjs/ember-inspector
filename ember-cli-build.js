'use strict';

/* eslint-env node */
/* global require, module */

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const VersionChecker = require('ember-cli-version-checker');
const mergeTrees = require('broccoli-merge-trees');
const concatFiles = require('broccoli-concat');
const stew = require('broccoli-stew');
const writeFile = require('broccoli-file-creator');
const replace = require('broccoli-string-replace');
const esTranspiler = require('broccoli-babel-transpiler');
const moduleResolver = require('amd-name-resolver').resolveModules({ throwOnRootAccess: false });
const Funnel = require('broccoli-funnel');
const packageJson = require('./package.json');
const modulesBabelPlugin = require('babel-plugin-transform-es2015-modules-amd');
const mv = stew.mv;
const map = stew.map;

/*global process */

const options = {
  fingerprint: {
    enabled: false
  },
  svgJar: {
    sourceDirs: [
      'public/assets/svg'
    ]
  }
};

// Firefox requires non-minified assets for review :(
options.minifyJS = { enabled: false };
options.minifyCSS = { enabled: false };

module.exports = function(defaults) {
  let checker = new VersionChecker(defaults);
  let emberChecker = checker.forEmber();

  if (emberChecker.isAbove('3.0.0')) {
    options.vendorFiles = { 'jquery.js': null };
  }

  let app = new EmberApp(defaults, options);

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  //
  const env = process.env.EMBER_ENV;

  app.import('vendor/babel-polyfill.js', { prepend: true });
  app.import('node_modules/basiccontext/dist/basicContext.min.css');
  app.import('node_modules/basiccontext/dist/themes/default.min.css');
  app.import('node_modules/basiccontext/dist/basicContext.min.js');

  // Ember Debug

  let emberDebug = 'ember_debug';

  emberDebug = new Funnel(emberDebug, {
    destDir: 'ember-debug',
    include: ['**/*.js'],
    exclude: [
      'vendor/loader.js',
      'vendor/source-map.js',
      'vendor/startup-wrapper.js',
    ]
  });

  emberDebug = esTranspiler(emberDebug, {
    moduleIds: true,
    plugins: [[modulesBabelPlugin, { noInterop: true }]],
    resolveModuleSource: moduleResolver
  });

  const previousEmberVersionsSupportedString = `[${packageJson.previousEmberVersionsSupported.map(function(item) {
    return `'${item}'`;
  }).join(',')}]`;
  const emberVersionsSupportedString = `[${packageJson.emberVersionsSupported.map(function(item) {
    return `'${item}'`;
  }).join(',')}]`;

  let startupWrapper = new Funnel('ember_debug', {
    srcDir: 'vendor',
    files: ['startup-wrapper.js'],
  });

  startupWrapper = replace(startupWrapper, {
    files: ['startup-wrapper.js'],
    patterns: [{
      match: /{{EMBER_VERSIONS_SUPPORTED}}/,
      replacement: emberVersionsSupportedString
    }]
  });

  let sourceMap = new Funnel('ember_debug', {
    srcDir: 'vendor',
    files: ['source-map.js'],
  });

  const loader = new Funnel('ember_debug', {
    srcDir: 'vendor',
    files: ['loader.js'],
  });

  sourceMap = map(sourceMap, '**/*.js', function(content) {
    return `(function() {\n${content}\n}());`;
  });

  emberDebug = mergeTrees([loader, startupWrapper, sourceMap, emberDebug]);

  emberDebug = concatFiles(emberDebug, {
    headerFiles: ['loader.js'],
    inputFiles: ['**/*.js'],
    outputFile: '/ember_debug.js',
    sourceMapConfig: { enabled: false }
  });

  const emberDebugs = [];
  ['basic', 'chrome', 'firefox', 'bookmarklet', 'websocket'].forEach(function(dist) {
    emberDebugs[dist] = map(emberDebug, '**/*.js', function(content) {
      return `(function(adapter, env) {\n${content}\n}('${dist}', '${env}'));`;
    });
  });

  let tree = app.toTree();

  const emberInspectorVersionPattern = [{
    match: /{{EMBER_INSPECTOR_VERSION}}/g,
    replacement: packageJson.version
  }];

  tree = replace(tree, {
    files: ['**/*.js'],
    patterns: emberInspectorVersionPattern
  });

  const minimumVersion = packageJson.emberVersionsSupported[0].replace(/\./g, '-');
  const webExtensionRoot = `panes-${minimumVersion}`;

  let replacementPattern = [{
    match: /{{env}}/,
    replacement: env === 'development' ? ' [DEV]' : ''
  }, {
    match: /{{PANE_ROOT}}/g,
    replacement: `panes-${minimumVersion}`
  }, {
    match: /{{PREVIOUS_EMBER_VERSIONS_SUPPORTED}}/g,
    replacement: previousEmberVersionsSupportedString
  }, {
    match: /{{EMBER_VERSIONS_SUPPORTED}}/g,
    replacement: emberVersionsSupportedString
  }];

  replacementPattern = replacementPattern.concat(emberInspectorVersionPattern);

  const skeletonWebExtension = replace('skeletons/web-extension', {
    files: ['*'],
    patterns: replacementPattern
  });

  const skeletonBookmarklet = replace('skeletons/bookmarklet', {
    files: ['*'],
    patterns: replacementPattern
  });

  let firefox = mergeTrees([
    mv(mergeTrees([tree, emberDebugs.firefox]), webExtensionRoot),
    skeletonWebExtension
  ]);

  let chrome = mergeTrees([
    mv(mergeTrees([tree, emberDebugs.chrome]), webExtensionRoot),
    skeletonWebExtension
  ]);

  let bookmarklet = mergeTrees([
    mv(mergeTrees([tree, emberDebugs.bookmarklet]), webExtensionRoot),
    skeletonBookmarklet
  ]);

  packageJson.previousEmberVersionsSupported.forEach(function(version) {
    version = version.replace(/\./g, '-');
    if (env === 'production') {
      const prevDist = `dist_prev/${env}`;

      bookmarklet = mergeTrees([
        mv(`${prevDist}/bookmarklet/panes-${version}`, `panes-${version}`),
        bookmarklet
      ]);
      firefox = mergeTrees([
        mv(`${prevDist}/firefox/panes-${version}`, `panes-${version}`),
        firefox
      ]);
      chrome = mergeTrees([
        mv(`${prevDist}/chrome/panes-${version}`, `panes-${version}`),
        chrome
      ]);
    } else {
      const file = writeFile('index.html', "This Ember version is not supported in development environment.");
      const emberDebugFile = writeFile('ember_debug.js', 'void(0);');
      chrome = mergeTrees([mv(file, `panes-${version}`), chrome]);
      firefox = mergeTrees([mv(file, `panes-${version}`), firefox]);
      bookmarklet = mergeTrees([mv(file, `panes-${version}`), mv(emberDebugFile, `panes-${version}`), bookmarklet]);
    }
  });

  // Pass the current dist to the Ember Inspector app.
  // EMBER DIST
  const dists = {
    chrome,
    firefox,
    bookmarklet,
    websocket: mergeTrees([tree, emberDebugs.websocket]),
    basic: mergeTrees([tree, emberDebugs.basic])
  };
  Object.keys(dists).forEach(function(key) {
    dists[key] = replace(dists[key], {
      files: ['**/*.js'],
      patterns: [{
        match: /{{EMBER_DIST}}/g,
        replacement: key
      }]
    });
  });

  // Add {{ remote-port }} to the head
  // so that the websocket addon can replace it.
  dists.websocket = replace(dists.websocket, {
    files: ['index.html'],
    patterns: [{
      match: /<head>/,
      replacement: '<head>\n{{ remote-port }}\n'
    }]
  });

  let output;

  if (env === 'test') {
    // `ember test` expects the index.html file to be in the
    // output directory.
    output = dists.basic;
  } else {

    // Change base tag for running tests in development env.
    dists.basic = replace(dists.basic, {
      files: ['tests/index.html'],
      patterns: [{
        match: /<base.*\/>/,
        replacement: '<base href="../" />'
      }]
    });

    output = mergeTrees([
      mv(dists.bookmarklet, 'bookmarklet'),
      mv(dists.firefox, 'firefox'),
      mv(dists.chrome, 'chrome'),
      mv(dists.websocket, 'websocket'),
      mv(dists.basic, 'testing')
    ]);
  }

  return output;
};
