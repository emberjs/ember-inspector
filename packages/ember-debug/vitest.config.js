// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: [
      {
        find: /@embroider\/macros/,
        replacement: resolve(
          __dirname,
          'test-support/embroider-macros-shim.js',
        ),
      },
      {
        find: /.*\/ember\/global\.js$/,
        replacement: resolve(__dirname, 'test-support/global.test-shim.js'),
      },
    ],
  },
});
