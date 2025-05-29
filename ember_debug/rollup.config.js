import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';

export default {
  input: 'main.js',
  output: {
    format: 'amd',
    amd: {
      id: 'ember-debug/main',
    },
    dir: 'dist',
  },
  plugins: [babel(), nodeResolve(), commonjs()],
};
