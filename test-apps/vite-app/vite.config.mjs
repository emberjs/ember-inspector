import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import path from 'path';
import fs from 'fs';
import send from 'send';

function emberDebug() {
  const testingDir = path.resolve(__dirname, '../../dist/testing');
  const distDir = path.resolve(__dirname, '../../dist');
  const shared = path.resolve(__dirname, '../shared');
  const testingFolderExists = fs.existsSync(testingDir);
  const dist = testingFolderExists ? testingDir : distDir;
  const files = [
    'ember_debug.js',
    'background.js',
    'content-script.js',
    'panes-3-16-0/ember_debug.js',
  ];
  return {
    name: 'ember-debug-loader',
    async resolveId(id, importer, opts) {
      if (id.startsWith('ember-debug')) {
        return id;
      }
      if (id.startsWith('vite-app')) {
        const sharedId = id.replace('vite-app', `${shared}/app`);
        const resolved = await this.resolve(sharedId, importer, opts);
        if (resolved) {
          return resolved;
        }
      }
      if (importer?.includes('shared')) {
        return this.resolve(id, importer.replace(shared, process.cwd()), opts);
      }
    },
    load(id) {
      if (id.startsWith('ember-debug/version')) {
        return `
        export default requireModule('${id}').default;
        export const compareVersion = requireModule('${id}').compareVersion;
        export const isInVersionSpecifier = requireModule('${id}').isInVersionSpecifier;
        `;
      }
      if (id.startsWith('ember-debug/type-check')) {
        return `
        export default requireModule('${id}').default;
        export const inspect = requireModule('${id}').inspect;
        `;
      }
      if (id.startsWith('ember-debug/ember')) {
        return `
        export default requireModule('${id}').default;
        export const VERSION = requireModule('${id}').VERSION;
        `;
      }
      if (id.startsWith('ember-debug')) {
        return `export default requireModule('${id}').default`;
      }
    },
    writeBundle() {
      for (const file of files) {
        fs.cpSync(
          path.resolve(dist, file),
          path.resolve(__dirname, 'dist', file),
        );
      }
    },
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          let originalUrl = req.originalUrl;
          const found =
            originalUrl &&
            files.find((f) => f.startsWith(originalUrl.slice(1)));
          if (found) {
            const assetUrl = path.resolve(dist, found);
            if (assetUrl) {
              return send(req, assetUrl).pipe(res);
            }
          }
          return next();
        });
      };
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      'test-app': 'vite-app',
    },
  },
  build: {
    rollupOptions: {
      external: [/^ember-debug/],
    },
  },
  plugins: [
    emberDebug(),
    classicEmberSupport(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
