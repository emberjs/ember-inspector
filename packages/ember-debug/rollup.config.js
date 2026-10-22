import { readdirSync, rmSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { globSync } from 'glob';

/**
 * The inspector UI build reads dist while this build runs,
 * so dist must never be empty.
 *
 * Old chunks are removed only after the new ones are written.
 */
function removeStaleFiles() {
  return {
    name: 'remove-stale-files',
    writeBundle(options, bundle) {
      let entries = readdirSync(options.dir, {
        recursive: true,
        withFileTypes: true,
      });

      for (let entry of entries) {
        if (!entry.isFile()) continue;

        let path = join(entry.parentPath, entry.name);
        let fileName = relative(options.dir, path).split(sep).join('/');

        if (!(fileName in bundle)) {
          rmSync(path);
        }
      }
    },
  };
}

export default {
  input: [
    'lib/ember.js',
    'lib/promise-assembler.js',
    'lib/type-check.js',
    'main.js',
    'models/profile-node.js',
    'port.js',
    'utils/version.js',
    'utils/versions.js',
    ...globSync('entrypoints/*.js'),
  ],
  output: {
    dir: 'dist',
  },

  plugins: [babel(), nodeResolve(), commonjs(), removeStaleFiles()],
};
