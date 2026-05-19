import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { globSync } from 'glob';
import del from 'rollup-plugin-delete';

export default {
  input: [
    'main.js',
    'lib/ember.js',
    'lib/promise-assembler.js',
    'lib/type-check.js',
    'models/profile-node.js',
    'port.js',
    'utils/version.js',
    'utils/versions.js',
    ...globSync('entrypoints/*.js'),
  ],
  output: {
    dir: 'dist',
  },

  plugins: [babel(), nodeResolve(), commonjs(), del({ targets: 'dist' })],
};
