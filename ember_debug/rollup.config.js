import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { globSync } from 'glob';

export default {
  input: [
    'main.js',
    ...globSync('adapters/**/*.js'),
    'utils/version.js',
    'port.js',
    'utils/ember.js',
    'utils/type-check',
    'models/profile-node.js',
    'libs/promise-assembler.js',
  ],
  output: {
    format: 'amd',
    amd: {
      autoId: true,
      // id: 'ember-debug/[name]',
      basePath: 'ember-debug',
    },
    chunkFileNames: '[name].js',
    dir: 'dist',
  },

  plugins: [
    babel(),
    nodeResolve(),
    commonjs(),
    /**
     * this plugin forces each of the intenral dependencies for each of the chunks to be prefixed with ember-debug
     */
    {
      name: 'rollup-plugin-name-amd-modules',
      renderChunk(code) {
        let splitCode = code.split('\n');

        splitCode[0] = splitCode[0].replaceAll(
          /'\.\/([^']*)'/g,
          `'ember-debug/$1'`,
        );

        return splitCode.join('\n');
      },
    },
  ],
};
