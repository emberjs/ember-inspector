/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var ES6Modules = require('broccoli-es6modules');
var mergeTrees  = require('broccoli-merge-trees');
var wrapFiles = require('broccoli-wrap');
var pickFiles = require('broccoli-static-compiler');
var concatFiles = require('broccoli-concat');
var removeFile = require('broccoli-file-remover');
var path = require('path');
var jsStringEscape = require('js-string-escape');
var eslint = require('broccoli-lint-eslint');
var mv = require('broccoli-stew').mv;
var writeFile = require('broccoli-file-creator');
var replace = require('broccoli-replace');
var esTranspiler = require('broccoli-babel-transpiler');
var packageJson = require('./package.json');

/*global process */

var options = {
  fingerprint: {
    enabled: false
  },
  babel: {
    // async/await
    optional: ['es7.asyncFunctions']
  },
  eslint: {
    testGenerator: eslintTestGenerator
  }
};

function renderErrors(errors) {
  if (!errors) { return ''; };
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

var app = new EmberApp(options);

var env = process.env.EMBER_ENV;

if (env !== 'production') {
  // To be able to compile htmlbars templates in tests
  app.import('bower_components/ember/ember-template-compiler.js');
}

app.import('vendor/babel-polyfill.js', { prepend: true });

// Ember Debug

var emberDebug = 'ember_debug';

emberDebug = pickFiles(emberDebug, {
  srcDir: '/',
  files: ['**/*.js'],
  destDir: '/ember-debug'
});

emberDebug = removeFile(emberDebug, {
  files: [
    'ember-debug/vendor/source-map.js',
  ]
});

emberDebug = removeFile(emberDebug, {
  files: [
    'ember-debug/vendor/startup-wrapper.js',
    'ember-debug/vendor/loader.js'
  ]
});

if (env === 'test') {
  var linted = eslint(emberDebug, {
    testGenerator: eslintTestGenerator,
    options: {
      configFile: './ember_debug/.eslintrc',
      rulePaths: ['./']
    }
  });
  emberDebug = mergeTrees([emberDebug, linted]);
}

emberDebug = new ES6Modules(emberDebug, {
  esperantoOptions: {
    absolutePaths: true,
    strict: true
  }
});
emberDebug = esTranspiler(emberDebug);

var previousEmberVersionsSupportedString = '[' + packageJson.previousEmberVersionsSupported.map(function(item) {
  return "'" + item + "'";
}).join(',') + ']';
var emberVersionsSupportedString = '[' + packageJson.emberVersionsSupported.map(function(item) {
  return "'" + item + "'";
}).join(',') + ']';

var startupWrapper = pickFiles('ember_debug', {
  srcDir: '/vendor',
  files: ['startup-wrapper.js'],
  destDir: '/'
});

startupWrapper = replace(startupWrapper, {
  files: ['startup-wrapper.js'],
  patterns: [{
    match: /{{EMBER_VERSIONS_SUPPORTED}}/,
    replacement: emberVersionsSupportedString
  }]
});

var sourceMap = pickFiles('ember_debug', {
  srcDir: '/vendor',
  files: ['source-map.js'],
  destDir: '/'
});

var loader = pickFiles('ember_debug', {
  srcDir: '/vendor',
  files: ['loader.js'],
  destDir: '/'
});

sourceMap = wrapFiles(sourceMap, {
  wrapper: ["(function() {\n", "\n}());"]
});

emberDebug = mergeTrees([loader, startupWrapper, sourceMap, emberDebug]);

emberDebug = concatFiles(emberDebug, {
  inputFiles: ['loader.js', '**/*.js'],
  outputFile: '/ember_debug.js',
  wrapInFunction: false
});

var emberDebugs = [];
['basic', 'chrome', 'firefox', 'bookmarklet', 'websocket'].forEach(function(dist) {
  emberDebugs[dist] = wrapFiles(emberDebug, {
    wrapper: ["(function(adapter, env) {\n", "\n}('" + dist + "', '" + env + "'));"]
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
      mv(prevDist + '/firefox/panes-' + version, 'data/panes-' + version),
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

module.exports = output;
