'use strict';

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      plugins: [
        ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
      ],
    },
  },
  plugins: ['ember'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
  },
  globals: {
    basicContext: false,
    require: false,
    requireModule: false,
  },
  rules: {
    'no-prototype-builtins': 'off',

    'ember/no-jquery': 'error',

    // Temporarily turn these off
    'ember/classic-decorator-hooks': 'off',
    'ember/classic-decorator-no-classic-methods': 'off',
    'ember/no-classic-classes': 'off',
    'ember/no-classic-components': 'off',
    'ember/no-computed-properties-in-native-classes': 'off',
    'ember/no-get': 'off',
    'ember/no-runloop': 'off',

    // Best practice
    'no-duplicate-imports': 'error',
    'ember/no-mixins': 'error',
  },
  overrides: [
    // node files
    {
      files: [
        './.eslintrc.js',
        './.prettierrc.js',
        './.stylelintrc.js',
        './.template-lintrc.js',
        './ember-cli-build.js',
        './testem.js',
        './blueprints/*/index.js',
        './config/**/*.js',
        './lib/*/index.js',
        './scripts/**/*.js',
        './server/**/*.js',
      ],
      excludedFiles: ['app/**'],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      extends: ['plugin:n/recommended'],
    },
    {
      // test files
      files: ['tests/**/*-test.{js,ts}'],
      extends: ['plugin:qunit/recommended'],
      rules: {
        'qunit/no-conditional-assertions': 'off',
        'qunit/no-early-return': 'off',
      },
    },
  ],
};
