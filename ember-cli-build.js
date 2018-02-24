/* eslint-env node */
/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var mergeTrees = require('broccoli-merge-trees');
var concatFiles = require('broccoli-concat');
var path = require('path');
var jsStringEscape = require('js-string-escape');
var eslint = require('broccoli-lint-eslint');
var stew = require('broccoli-stew');
var writeFile = require('broccoli-file-creator');
var replace = require('broccoli-string-replace');
var esTranspiler = require('broccoli-babel-transpiler');
var moduleResolver = require('amd-name-resolver').resolveModules({ throwOnRootAccess: false });
var Funnel = require('broccoli-funnel');
var packageJson = require('./package.json');
var modulesBabelPlugin = require('babel-plugin-transform-es2015-modules-amd');
var mv = stew.mv;
var map = stew.map;

/*global process */

var options = {
  fingerprint: {
    enabled: false
  }
};

function renderErrors(errors) {
  if (!errors) { return ''; }
  return errors.map(function(error) {
    return error.line + ':' + error.column + ' ' +
      ' - ' + error.message + ' (' + error.ruleId +')';
  }).join('\n');
}

function eslintTestGenerator(relativePath, errors) {
  var pass = !errors || errors.length === 0;
  return "import { module, test } from 'qunit';\n" +
    "module('ESLINT - " + path.dirname(relativePath) + "');\n" +
    "test('" + relativePath + " should pass eslint', function(assert) {\n" +
    "  assert.ok(" + pass + ", '" + relativePath + " should pass eslint." +
    jsStringEscape("\n" + renderErrors(errors)) + "');\n" +
   "});\n";
}

// Firefox requires non-minified assets for review :(
options.minifyJS = { enabled: false };
options.minifyCSS = { enabled: false };

module.exports = function(defaults) {
  var app = new EmberApp(defaults, options);

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
  var env = process.env.EMBER_ENV;

  app.import('vendor/babel-polyfill.js', { prepend: true });
  app.import('bower_components/contextMenu/contextMenu.js');
  app.import('bower_components/contextMenu/contextMenu.css');

  // Ember Debug

  var emberDebug = 'ember_debug';

  emberDebug = new Funnel(emberDebug, {
    destDir: 'ember-debug',
    include: ['**/*.js'],
    exclude: [
      'vendor/source-map.js',
      'vendor/startup-wrapper.js',
    ]
  });

  if (env === 'test') {
    var linted = eslint(emberDebug, {
      testGenerator: eslintTestGenerator,
      options: {
        configFile: './ember_debug/.eslintrc.js',
        rulePaths: ['./']
      }
    });
    emberDebug = mergeTrees([emberDebug, linted]);
  }

  emberDebug = esTranspiler(emberDebug, {
    moduleIds: true,
    plugins: [[modulesBabelPlugin, { noInterop: true }]],
    resolveModuleSource: moduleResolver
  });

  var previousEmberVersionsSupportedString = '[' + packageJson.previousEmberVersionsSupported.map(function(item) {
    return "'" + item + "'";
  }).join(',') + ']';
  var emberVersionsSupportedString = '[' + packageJson.emberVersionsSupported.map(function(item) {
    return "'" + item + "'";
  }).join(',') + ']';

  var startupWrapper = new Funnel('ember_debug', {
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

  var sourceMap = new Funnel('ember_debug', {
    srcDir: 'vendor',
    files: ['source-map.js'],
  });

  sourceMap = map(sourceMap, '**/*.js', function(content) {
    return "(function() {\n" + content + "\n}());";
  });

  emberDebug = mergeTrees([startupWrapper, sourceMap, emberDebug]);

  emberDebug = concatFiles(emberDebug, {
    inputFiles: ['**/*.js'],
    outputFile: '/ember_debug.js',
    sourceMapConfig: { enabled: false }
  });

  var emberDebugs = [];
  ['basic', 'chrome', 'firefox', 'bookmarklet', 'websocket'].forEach(function(dist) {
    emberDebugs[dist] = map(emberDebug, '**/*.js', function(content) {
      return "(function(adapter, env) {\n" + content + "\n}('" + dist + "', '" + env + "'));";
    });
  });

  var tree = app.toTree();

  var emberInspectorVersionPattern = [{
    match: /{{EMBER_INSPECTOR_VERSION}}/g,
    replacement: packageJson.version
  }];

  tree = replace(tree, {
    files: ['**/*.js'],
    patterns: emberInspectorVersionPattern
  });

  var minimumVersion = packageJson.emberVersionsSupported[0].replace(/\./g, '-');
  var webExtensionRoot = 'panes-' + minimumVersion;

  var replacementPattern = [{
    match: /{{env}}/,
    replacement: env === 'development' ? ' [DEV]' : ''
  }, {
    match: /{{PANE_ROOT}}/g,
    replacement: 'panes-' + minimumVersion
  }, {
    match: /{{PREVIOUS_EMBER_VERSIONS_SUPPORTED}}/g,
    replacement: previousEmberVersionsSupportedString
  }, {
    match: /{{EMBER_VERSIONS_SUPPORTED}}/g,
    replacement: emberVersionsSupportedString
  }];

  replacementPattern = replacementPattern.concat(emberInspectorVersionPattern);

  var skeletonWebExtension = replace('skeletons/web-extension', {
    files: ['*'],
    patterns: replacementPattern
  });

  var skeletonBookmarklet = replace('skeletons/bookmarklet', {
    files: ['*'],
    patterns: replacementPattern
  });

  var firefox = mergeTrees([
    mv(mergeTrees([tree, emberDebugs.firefox]), webExtensionRoot),
    skeletonWebExtension
  ]);

  var chrome = mergeTrees([
    mv(mergeTrees([tree, emberDebugs.chrome]), webExtensionRoot),
    skeletonWebExtension
  ]);

  var bookmarklet = mergeTrees([
    mv(mergeTrees([tree, emberDebugs.bookmarklet]), webExtensionRoot),
    skeletonBookmarklet
  ]);

  packageJson.previousEmberVersionsSupported.forEach(function(version) {
    version = version.replace(/\./g, '-');
    if (env === 'production') {
      var prevDist = 'dist_prev/' + env;

      bookmarklet = mergeTrees([
        mv(prevDist + '/bookmarklet/panes-' + version, 'panes-' + version),
        bookmarklet
      ]);
      firefox = mergeTrees([
        mv(prevDist + '/firefox/panes-' + version, 'panes-' + version),
        firefox
      ]);
      chrome = mergeTrees([
        mv(prevDist + '/chrome/panes-' + version, 'panes-' + version),
        chrome
      ]);
    } else {
      var file = writeFile('index.html', "This Ember version is not supported in development environment.");
      var emberDebugFile = writeFile('ember_debug.js', 'void(0);');
      chrome = mergeTrees([mv(file, 'panes-' + version), chrome]);
      firefox = mergeTrees([mv(file, 'panes-' + version), firefox]);
      bookmarklet = mergeTrees([mv(file, 'panes-' + version), mv(emberDebugFile, 'panes-' + version), bookmarklet]);
    }
  });

  // Pass the current dist to the Ember Inspector app.
  // EMBER DIST
  var dists = {
    chrome: chrome,
    firefox: firefox,
    bookmarklet: bookmarklet,
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

  var output;

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
