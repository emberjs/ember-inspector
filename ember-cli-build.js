'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const VersionChecker = require('ember-cli-version-checker');
const mergeTrees = require('broccoli-merge-trees');
const concatFiles = require('broccoli-concat');
const stew = require('broccoli-stew');
const writeFile = require('broccoli-file-creator');
const replace = require('broccoli-string-replace');
const Funnel = require('broccoli-funnel');
const packageJson = require('./package.json');
const { mv } = stew;

const {
  EMBER_VERSIONS_SUPPORTED,
  PREVIOUS_EMBER_VERSIONS_SUPPORTED,
} = require('ember-debug/versions');

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
};

// Firefox requires non-minified assets for review :(
options.minifyJS = { enabled: false };
options.minifyCSS = { enabled: false };

module.exports = function (defaults) {
  let checker = new VersionChecker(defaults);
  let emberChecker = checker.for('ember-source');

  if (emberChecker.isAbove('3.0.0')) {
    options.vendorFiles = { 'jquery.js': null };
  }

  if (process.env.EMBER_ENV !== 'test') {
    // https://github.com/ef4/ember-auto-import/issues/540
    options.autoImport.publicAssetURL = 'assets/';
  }

  // When running ember-try on Ember < 3.13, colocation support is
  // disabled in ember-cli-htmlbars and causes a build error. When
  // running ember-try, we actually don't care about the "app" side
  // at all – all we do is run the ember_debug tests (via a --filter
  // option to ember test in the ember-try config). The only reason
  // we are even building the app is to get the test harness (qunit
  // and friends) to work. In the long run, we should split up the
  // build and not run the app build in ember-try, but in the mean
  // time, this drops all *.hbs files (but keeping everything else)
  // to avoid the problem. The app will of course not work correctly
  // at runtime, but it was never meant to work on old ember versions
  // in the first place.
  if (!emberChecker.gte('3.13.0')) {
    options.trees = {
      app: new Funnel('app', {
        exclude: ['**/*.hbs'],
      }),
    };
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
  app.import('node_modules/compare-versions/index.js');
  app.import('node_modules/normalize.css/normalize.css');

  const previousEmberVersionsSupportedString = JSON.stringify(
    PREVIOUS_EMBER_VERSIONS_SUPPORTED,
  );
  const emberVersionsSupportedString = JSON.stringify(EMBER_VERSIONS_SUPPORTED);

  const emberDebugs = [];

  ['basic', 'chrome', 'firefox', 'bookmarklet', 'websocket'].forEach(
    function (dist) {
      let emberDebug = 'ember_debug/dist';

      let entryPoint = concatFiles(
        new Funnel(emberDebug, {
          destDir: 'ember-debug',
          include: [`${dist}-debug.js`],
        }),
        {
          inputFiles: ['**/*.js'],
          outputFile: '/ember_debug.js',
          sourceMapConfig: { enabled: false },
        },
      );

      emberDebugs[dist] = mergeTrees([emberDebug, entryPoint]);
    },
  );

  let tree = app.toTree();

  const emberInspectorVersionPattern = [
    {
      match: /{{EMBER_INSPECTOR_VERSION}}/g,
      replacement: packageJson.version,
    },
  ];

  tree = replace(tree, {
    files: ['**/*.js'],
    patterns: emberInspectorVersionPattern,
  });

  const minimumVersion = EMBER_VERSIONS_SUPPORTED[0].replace(/\./g, '-');
  const webExtensionRoot = `panes-${minimumVersion}`;

  let tabLabel;

  if (process.env.EMBER_INSPECTOR_TAB) {
    tabLabel = `Ember [${process.env.EMBER_INSPECTOR_TAB}]`;
  } else if (env === 'development') {
    tabLabel = `Ember [DEV]`;
  } else {
    tabLabel = 'Ember';
  }

  let replacementPattern = [
    {
      match: /{{TAB_LABEL}}/,
      replacement: tabLabel,
    },
    {
      match: /{{PANE_ROOT}}/g,
      replacement: `panes-${minimumVersion}`,
    },
    {
      match: /{{PREVIOUS_EMBER_VERSIONS_SUPPORTED}}/g,
      replacement: previousEmberVersionsSupportedString,
    },
    {
      match: /{{EMBER_VERSIONS_SUPPORTED}}/g,
      replacement: emberVersionsSupportedString,
    },
  ];

  replacementPattern = replacementPattern.concat(emberInspectorVersionPattern);

  const firefoxBackgroundServiceReplacement = [
    {
      match: /"service_worker": "background.js"/g,
      replacement: '"scripts": ["background.js"]',
    },
  ];

  const skeletonWebExtension = replace('skeletons/web-extension', {
    files: ['*'],
    patterns: replacementPattern,
  });

  const skeletonFirefoxWebExtension = replace('skeletons/web-extension', {
    files: ['*'],
    patterns: replacementPattern.concat(firefoxBackgroundServiceReplacement),
  });

  const skeletonBookmarklet = replace('skeletons/bookmarklet', {
    files: ['*'],
    patterns: replacementPattern,
  });

  let firefox = mergeTrees([
    mv(mergeTrees([tree, emberDebugs.firefox]), webExtensionRoot),
    skeletonFirefoxWebExtension,
  ]);

  let chrome = mergeTrees([
    mv(mergeTrees([tree, emberDebugs.chrome]), webExtensionRoot),
    skeletonWebExtension,
  ]);

  let bookmarklet = mergeTrees([
    mv(mergeTrees([tree, emberDebugs.bookmarklet]), webExtensionRoot),
    skeletonBookmarklet,
  ]);

  PREVIOUS_EMBER_VERSIONS_SUPPORTED.forEach(function (version) {
    version = version.replace(/\./g, '-');
    if (env === 'production') {
      const prevDist = `dist_prev/${env}`;

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

  // Pass the current dist to the Ember Inspector app.
  // EMBER DIST
  const dists = {
    chrome,
    firefox,
    bookmarklet,
    websocket: mergeTrees([tree, emberDebugs.websocket]),
    basic: mergeTrees([tree, emberDebugs.basic]),
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
  });

  // Add {{ remote-port }} to the head
  // so that the websocket addon can replace it.
  dists.websocket = replace(dists.websocket, {
    files: ['index.html'],
    patterns: [
      {
        match: /<head>/,
        replacement: '<head>\n{{ remote-port }}\n',
      },
    ],
  });

  let output;

  if (env === 'test') {
    // `ember test` expects the index.html file to be in the
    // output directory.
    // Change base tag for running tests in development env.
    dists.basic = replace(dists.basic, {
      files: ['tests/index.html'],
      patterns: [
        {
          match: /<base.*\/>/,
          replacement: '',
        },
      ],
    });
    output = mergeTrees([dists.basic, dists.chrome]);
  } else {
    dists.testing = mergeTrees([dists.basic, dists.chrome]);

    output = mergeTrees([
      mv(dists.bookmarklet, 'bookmarklet'),
      mv(dists.firefox, 'firefox'),
      mv(dists.chrome, 'chrome'),
      mv(dists.websocket, 'websocket'),
      mv(dists.testing, 'testing'),
    ]);
  }

  return output;
};
