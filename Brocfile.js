/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var ES6Modules = require('broccoli-es6modules');
var mergeTrees  = require('broccoli-merge-trees');
var wrapFiles = require('broccoli-wrap');
var pickFiles = require('broccoli-static-compiler');
var concatFiles = require('broccoli-concat');
var jshintTrees = require('broccoli-jshint');
var removeFile = require('broccoli-file-remover');

/*global process */
var dist = process.env.EMBER_DIST;

var options = {
  fingerprint: {
    enabled: false
  },
   vendorFiles: {
     'handlebars.js': false
  }
};

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
  var jshintedEmberDebug = jshintTrees(emberDebug, {
    description: 'JSHint - Ember Debug'
  });
  jshintedEmberDebug = pickFiles(jshintedEmberDebug, {
    srcDir: '/',
    destDir: 'ember-debug/tests'
  });
  emberDebug = mergeTrees([emberDebug, jshintedEmberDebug]);
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
