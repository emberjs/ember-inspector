import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { ember, extensions } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import svgJar from '@svg-jar/plugin/vite';
import { inspectorDists } from './config/inspector-dists.mjs';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

export default defineConfig({
  /**
   * The UI loads from a pane folder inside each extension,
   * for example chrome-extension://<id>/panes-3-16-0/index.html.
   */
  base: './',
  define: {
    'import.meta.env.EMBER_INSPECTOR_VERSION': JSON.stringify(
      packageJson.version,
    ),
    'import.meta.env.EMBER_VERSIONS_SUPPORTED': JSON.stringify(
      packageJson.emberVersionsSupported,
    ),
    'import.meta.env.PREVIOUS_EMBER_VERSIONS_SUPPORTED': JSON.stringify(
      packageJson.previousEmberVersionsSupported,
    ),
  },
  /**
   * The bookmarklet loads the UI from `pnpm serve:bookmarklet`
   * into any page.
   */
  preview: {
    cors: true,
  },
  plugins: [
    ember(),
    svgJar({ target: 'ember' }),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
    inspectorDists(),
  ],
});
