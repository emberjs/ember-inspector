import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { globSync } from 'glob';
import del from 'rollup-plugin-delete';

export default {
  input: [
    'main.js',
    'utils/version.js',
    'utils/type-check.js',
    'port.js',
    'utils/ember.js',
    'utils/type-check',
    'models/profile-node.js',
    'libs/promise-assembler.js',
    'lib/versions.js',
    ...globSync('entrypoints/*.js'),
  ],
  output: {
    dir: 'dist',
  },

  plugins: [
    babel(),
    nodeResolve(),
    commonjs(),
    // versions is required for ember-cli-build.js and should be kept between builds
    del({ targets: ['dist/*', '!dist/versions.js']}),
  ],
};
