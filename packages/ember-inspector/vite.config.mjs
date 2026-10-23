import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import svgJar from '@svg-jar/plugin/vite';
import { inspectorDists } from './config/inspector-dists.mjs';

export default defineConfig({
  /**
   * The UI loads from a pane folder inside each extension,
   * for example chrome-extension://<id>/panes-3-16-0/index.html.
   */
  base: './',
  /**
   * The bookmarklet loads the UI from `pnpm serve:bookmarklet`
   * into any page.
   */
  preview: {
    cors: true,
  },
  plugins: [
    classicEmberSupport(),
    ember(),
    svgJar({ target: 'ember' }),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
    inspectorDists(),
  ],
});
