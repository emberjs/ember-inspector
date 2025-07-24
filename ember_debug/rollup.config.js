import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { globSync } from 'glob';

export default {
  input: [
    'main.js',
    ...globSync('adapters/**/*.js'),
    'utils/version.js',
    'utils/type-check.js',
    'port.js',
    'utils/ember.js',
    'models/profile-node.js',
    'libs/promise-assembler.js',
    'lib/versions.js',
    ...globSync('entrypoints/*.js'),
  ],
  output: {
    dir: 'dist',
  },

  plugins: [babel(), nodeResolve(), commonjs()],
};
