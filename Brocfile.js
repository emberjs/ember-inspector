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

emberDebug = removeFile(emberDebug, {
  files: [
    'ember-debug/vendor/startup-wrapper.js',
    'ember-debug/vendor/loader.js'
  ]
});

emberDebug = new ES6Modules(emberDebug, {
  esperantoOptions: {
    absolutePaths: true,
    strict: true
  }
});
emberDebug = esTranspiler(emberDebug);

var startupWrapper = pickFiles('ember_debug', {
  srcDir: '/vendor',
  files: ['startup-wrapper.js'],
  destDir: '/'
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

var bookmarklet = mergeTrees([tree, emberDebugs.bookmarklet, 'skeleton_bookmarklet']);

var firefoxAndChromeExtra = pickFiles('shared', {
  srcDir: '/',
  files: ['in-page-script.js'],
  destDir: '/'
});

var firefox = mergeTrees([
  mv(mergeTrees([tree, firefoxAndChromeExtra, emberDebugs.firefox]), 'data/panes'),
  'skeleton_firefox'
]);

var chrome = mergeTrees([
  mv(mergeTrees([tree, firefoxAndChromeExtra, emberDebugs.chrome]), 'panes'),
  'skeleton_chrome'
]);

var websocket = mergeTrees([tree, emberDebugs.websocket]);
var basic = mergeTrees([tree, emberDebugs.basic]);

// Pass the current dist to the Ember Inspector app.
chrome = mergeTrees([chrome, mv(writeFile('dist-config.js', "window.EMBER_DIST='chrome';"), 'panes/assets')]);
firefox = mergeTrees([firefox, mv(writeFile('dist-config.js', "window.EMBER_DIST='firefox';"), 'data/panes/assets')]);
bookmarklet = mergeTrees([bookmarklet, mv(writeFile('dist-config.js', "window.EMBER_DIST='bookmarklet';"), 'assets')]);
websocket = mergeTrees([websocket, mv(writeFile('dist-config.js', "window.EMBER_DIST='websocket';"), 'assets')]);
basic = mergeTrees([basic, mv(writeFile('dist-config.js', "window.EMBER_DIST='basic';"), 'assets')]);

// Add {{ remote-port }} to the head
// so that the websocket addon can replace it.
websocket = replace(websocket, {
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
  output = basic;
} else {

  // Change base tag for running tests in development env.
  basic = replace(basic, {
    files: ['tests/index.html'],
    patterns: [{
      match: /<base.*\/>/,
      replacement: '<base href="../" />'
    }]
  });

  output = mergeTrees([
    mv(bookmarklet, 'bookmarklet'),
    mv(firefox, 'firefox'),
    mv(chrome, 'chrome'),
    mv(websocket, 'websocket'),
    mv(basic, 'testing')
  ]);
}

module.exports = output;
