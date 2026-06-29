/* eslint-disable no-undef */

'use strict';
const mergeTrees = require('broccoli-merge-trees');
const stew = require('broccoli-stew');
const writeFile = require('broccoli-file-creator');
const replace = require('broccoli-string-replace');
const Funnel = require('broccoli-funnel');
const { mv, rename, rm } = stew;
const { dirname, join } = require('path');
const emberInspectorPackage = require('ember-inspector/package.json');

const {
  EMBER_VERSIONS_SUPPORTED,
  PREVIOUS_EMBER_VERSIONS_SUPPORTED,
} = require('ember-debug/versions');

const emberInspectorDist = join(
  dirname(require.resolve('ember-inspector/package.json')),
  'dist',
);

module.exports = function () {
  const { EMBER_INSPECTOR_TAB, EMBER_ENV } = process.env;
  const minimumVersion = EMBER_VERSIONS_SUPPORTED[0].replace(/\./g, '-');

  const emberInspector = new Funnel(join(emberInspectorDist), {
    destDir: '.',
  });

  const patterns = [
    {
      match: /{{EMBER_INSPECTOR_VERSION}}/g,
      replacement: emberInspectorPackage.version,
    },
    {
      match: /{{TAB_LABEL}}/,
      replacement: (() => {
        if (EMBER_INSPECTOR_TAB) {
          return `Ember [${EMBER_INSPECTOR_TAB}]`;
        } else if (EMBER_ENV === 'development') {
          return `Ember [DEV]`;
        }

        return 'Ember';
      })(),
    },
    {
      match: /{{PANE_ROOT}}/g,
      replacement: `panes-${minimumVersion}`,
    },
    {
      match: /{{PREVIOUS_EMBER_VERSIONS_SUPPORTED}}/g,
      replacement: JSON.stringify(PREVIOUS_EMBER_VERSIONS_SUPPORTED),
    },
    {
      match: /{{EMBER_VERSIONS_SUPPORTED}}/g,
      replacement: JSON.stringify(EMBER_VERSIONS_SUPPORTED),
    },
  ];

  const firefoxBackgroundServiceReplacement = [
    {
      match: /"service_worker": "background.js"/g,
      replacement: '"scripts": ["background.js"]',
    },
  ];

  const skeletonWebExtension = replace('skeletons/web-extension', {
    files: ['*'],
    patterns,
  });

  const skeletonFirefoxWebExtension = replace('skeletons/web-extension', {
    files: ['*'],
    patterns: patterns.concat(firefoxBackgroundServiceReplacement),
  });

  const skeletonBookmarklet = replace('skeletons/bookmarklet', {
    files: ['*'],
    patterns,
  });

  const webExtensionRoot = `panes-${minimumVersion}`;

  let firefox = mergeTrees([
    mv(emberInspector, webExtensionRoot),
    skeletonFirefoxWebExtension,
  ]);

  let chrome = mergeTrees([
    mv(emberInspector, webExtensionRoot),
    skeletonWebExtension,
  ]);

  let bookmarklet = mergeTrees([
    mv(emberInspector, webExtensionRoot),
    skeletonBookmarklet,
  ]);

  PREVIOUS_EMBER_VERSIONS_SUPPORTED.forEach(function (rawVersion) {
    const version = rawVersion.replace(/\./g, '-');

    if (EMBER_ENV === 'production') {
      const prevDist = `dist_prev/${EMBER_ENV}`;

      bookmarklet = mergeTrees([
        mv(`${prevDist}/bookmarklet/panes-${version}`, `panes-${version}`),
        bookmarklet,
      ]);

      firefox = mergeTrees([
        mv(`${prevDist}/firefox/panes-${version}`, `panes-${version}`),
        firefox,
      ]);

      chrome = mergeTrees([
        mv(`${prevDist}/chrome/panes-${version}`, `panes-${version}`),
        chrome,
      ]);
    } else {
      const file = writeFile(
        'index.html',
        'This Ember version is not supported in development environment.',
      );

      const emberDebugFile = writeFile('ember_debug.js', 'void(0);');

      chrome = mergeTrees([mv(file, `panes-${version}`), chrome]);
      firefox = mergeTrees([mv(file, `panes-${version}`), firefox]);
      bookmarklet = mergeTrees([
        mv(file, `panes-${version}`),
        mv(emberDebugFile, `panes-${version}`),
        bookmarklet,
      ]);
    }
  });

  const emberDebug = new Funnel(
    join(dirname(require.resolve('ember-debug/package.json')), 'dist'),
  );

  // Pass the current dist to the Ember Inspector app.
  const dists = {
    chrome,
    firefox,
    bookmarklet,
    websocket: emberInspector,
  };

  const debugRoot = {
    chrome: webExtensionRoot,
    firefox: webExtensionRoot,
    bookmarklet: webExtensionRoot,
    websocket: '.',
  };

  Object.keys(dists).forEach(function (key) {
    dists[key] = replace(dists[key], {
      files: ['**/*.js'],
      patterns: [
        {
          match: /{{EMBER_DIST}}/g,
          replacement: key,
        },
      ],
    });

    let debug = rename(emberDebug, (relativePath) => {
      // rename dist specific entrypoint to ember_debug.js
      if (relativePath === `${key}-debug.js`) {
        return `ember_debug.js`;
      }

      return relativePath;
    });

    // remove other unused entrypoints
    debug = rm(debug, '*-debug.js');
    debug = mv(debug, debugRoot[key]);

    dists[key] = mergeTrees([dists[key], debug]);
  });

  return mergeTrees([
    mv(dists.bookmarklet, 'bookmarklet'),
    mv(dists.firefox, 'firefox'),
    mv(dists.chrome, 'chrome'),
    mv(dists.websocket, 'websocket'),
  ]);
};
