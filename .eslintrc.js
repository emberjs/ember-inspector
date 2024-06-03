'use strict';

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
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
    chrome: false,
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
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
      rules: {
        // this can be removed once the following is fixed
        // https://github.com/mysticatea/eslint-plugin-node/issues/77
        'node/no-unpublished-require': 'off',
      },
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
