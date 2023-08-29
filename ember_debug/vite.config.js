const babel = require('vite-plugin-babel').default;
const path = require('path');

/** @type {import('vite').UserConfig} */
// eslint-disable-next-line no-undef
module.exports = {
  optimizeDeps: {
    // exclude: ['@ember'],
    // disabled: false,
  },
  define: {
    'indexable(globalThis)': '{}',
  },
  root: 'ember_debug',
  build: {
    minify: true,
    lib: {
      // formats: ['amd'],
      entry: path.resolve('.', 'ember_debug/vite.entry.js'),
      name: 'ember-debug',
      fileName: () => `ember_debug.js`,
    },
  },
  plugins: [
    babel({
      filter: /^.*\.(ts|js)$/,
      babelConfig: {
        babelrc: false,
        configFile: false,
        plugins: [
          ['@babel/plugin-transform-typescript'],
          [
            'babel-plugin-unassert',
            {
              variables: [
                'assert',
                'info',
                'warn',
                'debug',
                'deprecate',
                'debugSeal',
                'debugFreeze',
                'runInDebug',
              ],
            },
          ],
          [
            '@babel/plugin-proposal-decorators',
            {
              legacy: true,
            },
          ],
          ['@babel/plugin-proposal-class-properties', { loose: true }],
        ],
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^require$/,
        replacement: './ember_debug/vite/require.js',
      },
      // {
      //   find: /^@glimmer\/validator$/,
      //   replacement: './ember_debug/vite/glimmer/validator.js',
      // },
      {
        find: /^ember\/version$/,
        replacement: 'ember-source/dist/packages/ember/version',
      },
      {
        find: /^router_js/,
        replacement: 'ember-source/dist/dependencies/router_js.js',
      },
      {
        find: /^@simple-dom\/document$/,
        replacement: 'ember-source/dist/dependencies/@simple-dom/document.js',
      },
      {
        find: /^backburner$/,
        replacement: 'ember-source/dist/dependencies/backburner.js',
      },
      {
        find: /^backburner.js$/,
        replacement: 'ember-source/dist/dependencies/backburner.js',
      },
      {
        find: /^@ember/,
        replacement: 'ember-source/dist/packages/@ember',
      },
      {
        find: /^@glimmer/,
        replacement: 'ember-source/dist/dependencies/@glimmer',
      },
      {
        find: /^ember-debug/,
        replacement: '',
      },
    ],
  },
};
