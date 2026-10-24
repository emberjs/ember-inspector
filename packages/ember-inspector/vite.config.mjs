import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { ember } from '@nullvoxpopuli/ember-vite';
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
    /**
     * The test page is at /tests/, so the tests need the app root.
     * In the extensions, the UI resolves URLs from its pane folder.
     */
    'import.meta.env.ROOT_URL': JSON.stringify(
      process.env.EMBER_ENV === 'test' ? '/' : '',
    ),
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
  resolve: {
    alias: [
      {
        find: /^ember-inspector\//,
        replacement: fileURLToPath(new URL('./app/', import.meta.url)),
      },
    ],
  },
  /**
   * The bookmarklet loads the UI from `pnpm serve:bookmarklet`
   * into any page.
   */
  preview: {
    cors: true,
  },
  plugins: [
    ember({ babel: { configFile: './babel.config.mjs' } }),
    svgJar({ target: 'ember' }),
    inspectorDists(),
  ],
});
