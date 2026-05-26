import { defineConfig } from 'vite';
import {
  extensions,
  hbs,
  scripts,
  compatPrebuild,
  assets,
  configTargets,
  ember,
} from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        bookmarklet: 'bookmarklet.html',
      },
    },
  },
  plugins: [
    hbs(),
    scripts(),
    compatPrebuild(),
    assets(),
    configTargets(),
    ember(),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
  server: {
    cors: true,
  },
});
