import { defineConfig } from 'vite';
import {
  extensions,
  scripts,
  compatPrebuild,
  assets,
  configTargets,
  ember,
  classicEmberSupport,
} from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    scripts(),
    compatPrebuild(),
    assets(),
    configTargets(),
    classicEmberSupport(),
    ember(),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
    viteStaticCopy({
      targets: [
        {
          src: '../build/skeletons/bookmarklet/load_inspector.js',
          dest: 'bookmarklet',
          rename: { stripBase: true },
          transform: (content) => content.replaceAll('{{PANE_ROOT}}', '..'),
        },
        {
          src: '../ember-debug/dist/!(*-debug).js',
          rename: { stripBase: true },
          dest: '.',
        },
        {
          src: '../ember-debug/dist/bookmarklet-debug.js',
          rename: { stripBase: true, name: 'ember_debug.js' },
          dest: '.',
        },
      ],
    }),
  ],
  server: {
    cors: true,
  },
});
