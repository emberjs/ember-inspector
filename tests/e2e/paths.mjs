import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

const inspectorDist = join(root, 'packages/ember-inspector/dist');

export const dists = {
  chrome: join(inspectorDist, 'chrome'),
  firefox: join(inspectorDist, 'firefox'),
  bookmarklet: join(inspectorDist, 'bookmarklet'),
};

export const apps = [
  testApp('vite-test-app', { hasData: false }),
  testApp('classic-test-app', { hasData: true }),
];

function testApp(name, options) {
  let dir = join(root, 'packages', name);
  let emberSource = join(dir, 'node_modules/ember-source/package.json');

  return {
    name,
    dist: join(dir, 'dist'),
    emberVersion: JSON.parse(readFileSync(emberSource, 'utf8')).version,
    ...options,
  };
}

export function assertBuilt(...paths) {
  for (let path of paths) {
    if (!existsSync(path)) {
      throw new Error(`${path} is missing. Run \`pnpm test:e2e:build\` first.`);
    }
  }
}
