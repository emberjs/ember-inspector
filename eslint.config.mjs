/**
 * Debugging:
 *   https://eslint.org/docs/latest/use/configure/debug
 *  ----------------------------------------------------
 *
 *   Print a file's calculated configuration
 *
 *     npx eslint --print-config path/to/file.js
 *
 *   Inspecting the config
 *
 *     npx eslint --inspect-config
 *
 */
import globals from 'globals';
import js from '@eslint/js';

import ember from 'eslint-plugin-ember/recommended';

import prettier from 'eslint-plugin-prettier/recommended';
import qunit from 'eslint-plugin-qunit';
import n from 'eslint-plugin-n';
import importPlugin from 'eslint-plugin-import';

import babelParser from '@babel/eslint-parser';

const parserOptions = {
  esm: {
    js: {
      ecmaFeatures: { modules: true },
      ecmaVersion: 'latest',
      requireConfigFile: false,
      babelOptions: {
        plugins: [
          [
            '@babel/plugin-proposal-decorators',
            { decoratorsBeforeExport: true },
          ],
        ],
      },
    },
  },
};

export default [
  js.configs.recommended,
  ember.configs.base,
  ember.configs.gjs,
  prettier,
  /**
   * Ignores must be in their own object
   * https://eslint.org/docs/latest/use/configure/ignore
   */
  {
    ignores: [
      'dist/',
      'packages/ember-debug/dist/',
      'node_modules/',
      'coverage/',
      '!**/.*',
      'vendor/',
      'dist_prev/',
      'skeletons/',
      'packages/ember-debug/vendor/startup-wrapper.js',
    ],
  },
  /**
   * https://eslint.org/docs/latest/use/configure/configuration-files#configuring-linter-options
   */
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    rules: {
      'no-prototype-builtins': 'off',
      'no-useless-escape': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      parser: babelParser,
    },
  },
  {
    files: ['**/*.{js,gjs}'],
    languageOptions: {
      parserOptions: parserOptions.esm.js,
      globals: {
        ...globals.browser,
        basicContext: false,
        requireModule: false,
        globalThis: true,
        chrome: 'readonly',
      },
    },
  },
  {
    files: ['tests/**/*-test.{js,gjs}'],
    plugins: {
      qunit,
    },
  },
  /**
   * CJS node files
   */
  {
    files: [
      '**/*.cjs',
      'config/**/*.js',
      'lib/*/index.js',
      'scripts/**/*.js',
      'testem.js',
      'testem*.js',
      '.prettierrc.js',
      '.stylelintrc.js',
      '.template-lintrc.js',
      'babel.config.js',
      'ember-cli-build.js',
      'gulpfile.js',
    ],
    plugins: {
      n,
    },

    languageOptions: {
      sourceType: 'script',
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
        basicContext: false,
        requireModule: false,
      },
    },
  },
  /**
   * ESM node files
   */
  {
    files: ['**/*.mjs'],
    plugins: {
      n,
    },

    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      parserOptions: parserOptions.esm.js,
      globals: {
        ...globals.node,
        basicContext: false,
        requireModule: false,
      },
    },
  },
  {
    files: ['packages/ember-debug/**/*.js'],
    ignores: ['packages/ember-debug/**/rollup.config.js'],
    plugins: {
      ...importPlugin.flatConfigs.recommended.plugins,
    },
    rules: {
      ...importPlugin.flatConfigs.recommended.rules,
      'import/extensions': ['error', 'always'],
    },
  },
];
