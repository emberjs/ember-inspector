import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { globSync } from 'glob';
import del from 'rollup-plugin-delete';

/**
 * The inspector UI build reads ember-debug/dist when it starts.
 * In watch mode, do not delete dist, so both watchers can run together.
 */
const isWatching = Boolean(process.env.ROLLUP_WATCH);

export default {
  input: [
    'lib/ember.js',
    'lib/promise-assembler.js',
    'lib/type-check.js',
    'main.js',
    'models/profile-node.js',
    'port.js',
    'utils/version.js',
    'utils/versions.js',
    ...globSync('entrypoints/*.js'),
  ],
  output: {
    dir: 'dist',
  },

  plugins: [
    babel(),
    nodeResolve(),
    commonjs(),
    !isWatching && del({ targets: 'dist' }),
  ],
};
