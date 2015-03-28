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

/*global process */
var dist = process.env.EMBER_DIST;

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

if (dist === 'firefox') {
  options.minifyJS = { enabled: false };
  options.minifyCSS = { enabled: false };
}
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
    config: './eslint.json',
    rulesdir: './'
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

emberDebug = wrapFiles(emberDebug, {
  wrapper: ["(function(adapter) {\n", "\n}('" + (dist || 'basic') + "'));"]
});

var tree = app.toTree();
tree = mergeTrees([tree, emberDebug]);

if (dist === 'bookmarklet') {
  var extra = pickFiles('bookmarklet', {
    srcDir: '/',
    files: ['load_inspector.js'],
    destDir: '/'
  });
  tree = mergeTrees([tree, extra]);
}

if (dist === 'firefox' || dist === 'chrome') {
  var extra = pickFiles('shared', {
    srcDir: '/',
    files: ['in-page-script.js'],
    destDir: '/'
  });
  tree = mergeTrees([tree, extra]);
}

module.exports = tree;
