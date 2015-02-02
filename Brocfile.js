/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var compileES6  = require('ember-cli/node_modules/broccoli-es6-concatenator');
var mergeTrees  = require('broccoli-merge-trees');
var wrapFiles = require('broccoli-wrap');
var pickFiles = require('broccoli-static-compiler');
var concatFiles = require('broccoli-concat');
var jshintTrees = require('broccoli-jshint');
var removeFile = require('broccoli-file-remover');

var app = new EmberApp({
  fingerprint: {
    enabled: false
  }
});

app.import('vendor/list-view/list-view.js');

// /*global process */
var dist = process.env.EMBER_DIST;
var env = process.env.EMBER_ENV;

// Ember Debug

var emberDebug = 'ember_debug';

emberDebug = pickFiles(emberDebug, {
  srcDir: '/',
  files: ['**/*.js'],
  destDir: '/ember-debug'
});

emberDebug = removeFile(emberDebug, {
  files: ['ember-debug/vendor/source-map.js']
});

if (env === 'test') {
  var jshintedEmberDebug = jshintTrees(emberDebug, {
    description: 'JSHint - Ember Debug'
  });
  jshintedEmberDebug = pickFiles(jshintedEmberDebug, {
    srcDir: '/',
    destDir: 'ember-debug/tests'
  });
  emberDebug = mergeTrees([emberDebug, jshintedEmberDebug]);
}

emberDebug = compileES6(emberDebug, {
  inputFiles: ['ember-debug/**/*.js'],
  loaderFile: 'ember-debug/vendor/loader.js',
  outputFile: '/ember_debug.js',
  wrapInEval: false,
  ignoredModules: [
    'ember-debug/vendor/loader',
    'ember-debug/vendor/startup-wrapper',
  ]
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

sourceMap = wrapFiles(sourceMap, {
  wrapper: ["(function() {\n", "\n}());"]
});

emberDebug = mergeTrees([startupWrapper, emberDebug]);
emberDebug = mergeTrees([sourceMap, emberDebug]);

emberDebug = concatFiles(emberDebug, {
  inputFiles: ['**/*.js'],
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
