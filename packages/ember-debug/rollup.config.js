import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { globSync } from 'glob';
import del from 'rollup-plugin-delete';
import { basename, extname } from 'path';

export default {
  input: Object.fromEntries([
    ...[
      'lib/ember.js',
      'lib/promise-assembler.js',
      'lib/type-check.js',
      'models/profile-node.js',
      'src/main.js',
      'src/port.js',
      'utils/version.js',
      'utils/versions.js',
    ].map((f) => [basename(f, extname(f)), f]),
    ...globSync('entrypoints/*.js').map((f) => [
      `${basename(f, extname(f))}-debug`,
      f,
    ]),
  ]),
  output: {
    dir: 'dist',
  },

  plugins: [
    babel({
      babelHelpers: 'bundled',
    }),
    nodeResolve(),
    commonjs(),
    del({ targets: 'dist' }),
  ],
};
