import {
  cpSync,
  existsSync,
  globSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EMBER_VERSIONS_SUPPORTED,
  PREVIOUS_EMBER_VERSIONS_SUPPORTED,
} from 'ember-debug/versions';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf8'),
);
const emberDebugDist = join(
  dirname(fileURLToPath(import.meta.resolve('ember-debug/package.json'))),
  'dist',
);

/**
 * Vite builds the UI once, into this folder.
 * The plugin then copies it into each dist.
 */
const UI_BUILD = 'tmp/ui';

const DIST = join(root, 'dist');
const PLACEHOLDER = '{{EMBER_DIST}}';
const CHANGELOG = join(root, '../../CHANGELOG.md');

/**
 * Writes the browser extensions and the other dists from one UI build.
 *
 * - dist/chrome: the web-extension skeleton, with the UI in panes-<version>/
 * - dist/firefox: the same, with a Firefox background script
 * - dist/bookmarklet: the bookmarklet skeleton, with the UI in panes-<version>/
 * - dist/websocket: the UI, for ember-cli-remote-inspector
 * - dist/testing: the basic UI, with dist/chrome on top
 *
 * Each copy of the UI loads its own ember-debug build as `ember_debug.js`,
 * and picks its adapter by the dist name.
 *
 * testem runs the tests from dist/testing.
 */
export function inspectorDists() {
  let mode;
  let command;

  return {
    name: 'ember-inspector:dists',

    config(_config, env) {
      mode = env.mode;

      if (env.isPreview) {
        return { build: { outDir: 'dist' } };
      }

      /**
       * Firefox add-on review needs readable code.
       */
      return {
        build: {
          outDir: UI_BUILD,
          emptyOutDir: true,
          minify: false,
          cssMinify: false,
          rolldownOptions: { output: { minify: false } },
        },
      };
    },

    configResolved(config) {
      command = config.command;
    },

    /**
     * The dev server serves the UI on its own, like the basic dist.
     */
    transform: {
      filter: { code: PLACEHOLDER },
      handler(code) {
        if (command !== 'serve') return;

        return code.replaceAll(PLACEHOLDER, 'basic');
      },
    },

    /**
     * Some tests load the files of the chrome extension.
     * The dev server serves them where dist/testing has them.
     */
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        let pathname = new URL(req.url, 'http://x').pathname;
        let file =
          pathname === '/CHANGELOG.md' ? CHANGELOG : extensionFile(pathname);

        if (!file) return next();

        let content = readFileSync(file, 'utf8');

        if (file.startsWith(SKELETONS)) {
          content = replaceAll(content, skeletonReplacements(mode));
        }

        res.setHeader('Content-Type', contentType(file));
        res.end(content);
      });
    },

    /**
     * The dists copy ember-debug,
     * so `vite build --watch` rebuilds when ember-debug changes.
     */
    buildStart() {
      for (let file of readdirSync(emberDebugDist)) {
        this.addWatchFile(join(emberDebugDist, file));
      }
    },

    /**
     * The Changelog page shows this file.
     */
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'CHANGELOG.md',
        source: readFileSync(CHANGELOG, 'utf8'),
      });
    },

    /**
     * Rolldown also calls `closeBundle` after a failed build,
     * but it calls `writeBundle` only after it wrote the files.
     */
    writeBundle() {
      let ui = join(root, UI_BUILD);

      rmSync(DIST, { recursive: true, force: true });

      for (let [name, write] of Object.entries(DISTS)) {
        write(ui, join(DIST, name), mode);
      }
    },
  };
}

const SKELETONS = join(root, 'skeletons');

const CONTENT_TYPES = {
  css: 'text/css',
  html: 'text/html',
  js: 'text/javascript',
  json: 'application/json',
  md: 'text/markdown',
};

function contentType(file) {
  return CONTENT_TYPES[file.split('.').pop()] ?? 'text/plain';
}

/**
 * The path of a file of dist/testing that the UI build does not write,
 * or undefined.
 */
function extensionFile(pathname) {
  if (pathname.startsWith(`/${PANE_ROOT}/`)) {
    let paneFile = pathname.slice(`/${PANE_ROOT}/`.length);
    let file =
      paneFile === 'ember_debug.js'
        ? join(emberDebugDist, 'chrome-debug.js')
        : join(emberDebugDist, paneFile);

    return isInside(emberDebugDist, file) && existsSync(file)
      ? file
      : undefined;
  }

  let skeleton = join(SKELETONS, 'web-extension');
  let file = join(skeleton, pathname);

  if (pathname !== '/' && isInside(skeleton, file) && existsSync(file)) {
    return file;
  }
}

function isInside(folder, file) {
  let path = relative(folder, file);

  return path !== '' && !path.startsWith('..') && !path.startsWith(sep);
}

const DISTS = {
  chrome: (ui, dest, mode) => writeWebExtension(ui, dest, mode, 'chrome'),
  firefox: (ui, dest, mode) => writeWebExtension(ui, dest, mode, 'firefox'),
  bookmarklet: writeBookmarklet,
  websocket: writeWebsocket,
  testing: writeTesting,
};

function paneFolder(version) {
  return `panes-${version.replace(/\./g, '-')}`;
}

const PANE_ROOT = paneFolder(EMBER_VERSIONS_SUPPORTED[0]);

/**
 * One copy of the UI, wired to the ember-debug build of `dist`.
 */
function writeUI(ui, dest, dist) {
  cpSync(ui, dest, { recursive: true });

  for (let file of globSync('**/*.js', { cwd: dest })) {
    replaceInFile(join(dest, file), [[PLACEHOLDER, dist]]);
  }

  cpSync(emberDebugDist, dest, { recursive: true });
  cpSync(
    join(emberDebugDist, `${dist}-debug.js`),
    join(dest, 'ember_debug.js'),
  );
}

function writeWebExtension(ui, dest, mode, dist) {
  let replacements = skeletonReplacements(mode);

  if (dist === 'firefox') {
    replacements.push([
      '"service_worker": "background.js"',
      '"scripts": ["background.js"]',
    ]);
  }

  writeSkeleton('web-extension', dest, replacements);
  writeUI(ui, join(dest, PANE_ROOT), dist);
  writePreviousPanes(dest, mode, dist);
}

function writeBookmarklet(ui, dest, mode) {
  writeSkeleton('bookmarklet', dest, skeletonReplacements(mode));
  writeUI(ui, join(dest, PANE_ROOT), 'bookmarklet');
  writePreviousPanes(dest, mode, 'bookmarklet');
}

/**
 * ember-cli-remote-inspector replaces `{{ remote-port }}`.
 */
function writeWebsocket(ui, dest) {
  writeUI(ui, dest, 'websocket');
  replaceInFile(join(dest, 'index.html'), [
    ['<head>', '<head>\n{{ remote-port }}\n'],
  ]);
}

function writeTesting(ui, dest, mode) {
  writeUI(ui, dest, 'basic');
  writeWebExtension(ui, dest, mode, 'chrome');
}

/**
 * Older inspector builds handle older Ember versions.
 * `pnpm panes:download` puts them in dist_prev/ for production builds.
 */
function writePreviousPanes(dest, mode, dist) {
  for (let version of PREVIOUS_EMBER_VERSIONS_SUPPORTED) {
    let pane = join(dest, paneFolder(version));

    if (mode === 'production') {
      cpSync(
        join(root, 'dist_prev', 'production', dist, paneFolder(version)),
        pane,
        { recursive: true },
      );
      continue;
    }

    mkdirSync(pane, { recursive: true });
    writeFileSync(
      join(pane, 'index.html'),
      'This Ember version is not supported in development environment.',
    );

    if (dist === 'bookmarklet') {
      writeFileSync(join(pane, 'ember_debug.js'), 'void(0);');
    }
  }
}

function tabLabel(mode) {
  if (process.env.EMBER_INSPECTOR_TAB) {
    return `Ember [${process.env.EMBER_INSPECTOR_TAB}]`;
  }

  if (mode === 'development') {
    return 'Ember [DEV]';
  }

  return 'Ember';
}

function skeletonReplacements(mode) {
  return [
    ['{{TAB_LABEL}}', tabLabel(mode)],
    ['{{PANE_ROOT}}', PANE_ROOT],
    [
      '{{PREVIOUS_EMBER_VERSIONS_SUPPORTED}}',
      JSON.stringify(PREVIOUS_EMBER_VERSIONS_SUPPORTED),
    ],
    ['{{EMBER_VERSIONS_SUPPORTED}}', JSON.stringify(EMBER_VERSIONS_SUPPORTED)],
    ['{{EMBER_INSPECTOR_VERSION}}', packageJson.version],
  ];
}

function writeSkeleton(name, dest, replacements) {
  let skeleton = join(SKELETONS, name);

  cpSync(skeleton, dest, { recursive: true });

  for (let file of globSync('**/*.{js,json,html}', { cwd: skeleton })) {
    replaceInFile(join(dest, file), replacements);
  }
}

function replaceAll(content, replacements) {
  for (let [from, to] of replacements) {
    content = content.replaceAll(from, to);
  }

  return content;
}

function replaceInFile(path, replacements) {
  let content = readFileSync(path, 'utf8');
  let replaced = replaceAll(content, replacements);

  if (replaced !== content) {
    writeFileSync(path, replaced);
  }
}
