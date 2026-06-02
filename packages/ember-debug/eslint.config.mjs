import babelParser from '@babel/eslint-parser';
import ember from 'eslint-plugin-ember/recommended';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ember.configs.base,
  prettierConfig,
  {
    ignores: ['dist/', 'vendor/startup-wrapper.js'],
  },
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
    ignores: ['rollup.config.js'],
    plugins: {
      ...importPlugin.flatConfigs.recommended.plugins,
    },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
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
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        requireModule: false,
        globalThis: true,
        chrome: 'readonly',
      },
    },
    rules: {
      ...importPlugin.flatConfigs.recommended.rules,
      'import/extensions': ['error', 'ignorePackages'],
    },
  },
  {
    files: ['rollup.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
];
