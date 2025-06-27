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

import ts from 'typescript-eslint';

import ember from 'eslint-plugin-ember/recommended';

import prettier from 'eslint-plugin-prettier/recommended';
import qunit from 'eslint-plugin-qunit';
import n from 'eslint-plugin-n';

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
    ts: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
};

export default ts.config(
  js.configs.recommended,
  ember.configs.base,
  ember.configs.gjs,
  ember.configs.gts,
  prettier,
  /**
   * Ignores must be in their own object
   * https://eslint.org/docs/latest/use/configure/ignore
   */
  {
    ignores: [
      'dist/',
      'ember_debug/dist/',
      'node_modules/',
      'test-apps/classic/node_modules/',
      'test-apps/classic/dist/',
      'test-apps/classic/public/',
      'test-apps/tests/helpers/index.ts',
      'coverage/',
      '!**/.*',
      'vendor/',
      'dist_prev/',
      'skeletons/',
      'ember_debug/vendor/startup-wrapper.js',
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
  { rules: { 'no-prototype-builtins': 'off', 'no-useless-escape': 'off' } },
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
        chrome: true,
      },
    },
  },
  {
    files: ['**/*.{ts,gts}'],
    languageOptions: {
      parser: ember.parser,
      parserOptions: parserOptions.esm.ts,
    },
    extends: [...ts.configs.recommendedTypeChecked, ember.configs.gts],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: [
      'tests/**/*-test.{js,gjs,ts,gts}',
      'test-apps/classic/tests/**/*-test.{js,gjs,ts,gts}',
    ],
    plugins: {
      qunit,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        basicContext: false,
        requireModule: false,
        chrome: true,
      },
    },
  },
  /**
   * CJS node files
   */
  {
    files: [
      '**/*.cjs',
      'config/**/*.js',
      'test-apps/classic/config/**/*.js',
      'lib/*/index.js',
      'scripts/**/*.js',
      'testem.js',
      'test-apps/classic/testem.js',
      'testem*.js',
      '.prettierrc.js',
      '.stylelintrc.js',
      '.template-lintrc.js',
      'babel.config.js',
      'ember-cli-build.js',
      'test-apps/classic/ember-cli-build.js',
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
);
