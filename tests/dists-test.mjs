import { execFileSync } from 'node:child_process';
import { existsSync, globSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { before, describe, test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const inspector = join(root, 'packages/ember-inspector');
const dist = join(inspector, 'dist');
const emberDebugDist = join(root, 'packages/ember-debug/dist');

const packageJson = JSON.parse(
  readFileSync(join(inspector, 'package.json'), 'utf8'),
);
const PANE = 'panes-3-16-0';

function read(...path) {
  return readFileSync(join(dist, ...path), 'utf8');
}

/**
 * The URLs of the scripts and style sheets in an HTML file.
 */
function assetUrls(html) {
  let urls = [];

  for (let [, url] of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) {
    urls.push(url);
  }

  for (let [tag] of html.matchAll(/<link\b[^>]*>/g)) {
    let href = tag.match(/\bhref="([^"]+)"/);
    if (/\brel="stylesheet"/.test(tag) && href) urls.push(href[1]);
  }

  return urls;
}

/**
 * The JavaScript of one copy of the UI.
 */
function uiCode(...pane) {
  return globSync('assets/**/*.js', { cwd: join(dist, ...pane) })
    .map((file) => read(...pane, file))
    .join('\n');
}

describe('pnpm build', { timeout: 300_000 }, () => {
  before(() => {
    /**
     * EMBER_INSPECTOR_TAB replaces the tab label that a test checks.
     */
    let env = { ...process.env };
    delete env.EMBER_INSPECTOR_TAB;

    execFileSync('pnpm', ['build:ember-debug'], { cwd: root });
    execFileSync('pnpm', ['--filter', 'ember-inspector', 'build'], {
      cwd: root,
      env,
    });
  });

  test('it writes one folder per dist', () => {
    for (let name of [
      'chrome',
      'firefox',
      'bookmarklet',
      'websocket',
      'testing',
    ]) {
      assert.ok(existsSync(join(dist, name)), `dist/${name} exists`);
    }
  });

  for (let [name, pane, emberDebug] of [
    ['chrome', ['chrome', PANE], 'chrome'],
    ['firefox', ['firefox', PANE], 'firefox'],
    ['bookmarklet', ['bookmarklet', PANE], 'bookmarklet'],
    ['websocket', ['websocket'], 'websocket'],
    ['testing', ['testing'], 'basic'],
  ]) {
    test(`${name}: the UI uses the ${emberDebug} adapter and ember-debug build`, () => {
      let code = uiCode(...pane);

      assert.match(
        code,
        new RegExp(`["'\`/]${emberDebug}["'\`]`),
        'the dist name replaces the placeholder',
      );
      assert.ok(!code.includes('{{EMBER_DIST}}'), 'no placeholder is left');
      assert.equal(
        read(...pane, 'ember_debug.js'),
        readFileSync(join(emberDebugDist, `${emberDebug}-debug.js`), 'utf8'),
      );
      assert.ok(
        existsSync(join(dist, ...pane, 'versions.js')),
        'the chunks of ember-debug are next to ember_debug.js',
      );
    });

    test(`${name}: index.html loads its assets relative to itself`, () => {
      let urls = assetUrls(read(...pane, 'index.html'));

      assert.ok(urls.length > 0, 'index.html loads scripts and styles');

      for (let url of urls) {
        assert.doesNotMatch(url, /^(\/|[a-z]+:)/, `${url} is relative`);
        assert.ok(
          existsSync(join(dist, ...pane, url.split(/[?#]/)[0])),
          `${url} exists`,
        );
      }
    });
  }

  test('the web extensions fill in the manifest', () => {
    let chrome = JSON.parse(read('chrome', 'manifest.json'));
    let firefox = JSON.parse(read('firefox', 'manifest.json'));

    assert.equal(chrome.version, packageJson.version);
    assert.equal(chrome.icons['16'], `${PANE}/assets/images/icon16.png`);
    assert.ok(existsSync(join(dist, 'chrome', chrome.icons['16'])));
    assert.deepEqual(chrome.background, { service_worker: 'background.js' });
    assert.deepEqual(firefox.background, { scripts: ['background.js'] });
  });

  test('the devtools panel points at the pane', () => {
    let devtools = read('chrome', 'devtools.js');

    assert.ok(devtools.includes(`'Ember [DEV]'`), 'development tab label');
    assert.ok(devtools.includes(`'${PANE}/assets/svg/ember-icon.svg'`));
    assert.ok(devtools.includes(`'${PANE}/index.html'`));
    assert.ok(
      existsSync(join(dist, 'chrome', PANE, 'assets/svg/ember-icon.svg')),
    );
  });

  test('no skeleton placeholder is left', () => {
    for (let name of ['chrome', 'firefox', 'bookmarklet']) {
      for (let file of globSync('*.{js,json,html}', {
        cwd: join(dist, name),
      })) {
        assert.doesNotMatch(
          read(name, file),
          /{{(TAB_LABEL|PANE_ROOT|EMBER_INSPECTOR_VERSION|EMBER_VERSIONS_SUPPORTED|PREVIOUS_EMBER_VERSIONS_SUPPORTED)}}/,
          `${name}/${file}`,
        );
      }
    }

    assert.ok(
      read('bookmarklet', 'load_inspector.js').includes(
        `'${PANE}/ember_debug.js'`,
      ),
    );
  });

  test('previous panes are stubs in development builds', () => {
    for (let version of packageJson.previousEmberVersionsSupported) {
      let pane = `panes-${version.replace(/\./g, '-')}`;

      for (let name of ['chrome', 'firefox', 'bookmarklet']) {
        assert.match(read(name, pane, 'index.html'), /not supported/);
      }

      assert.equal(read('bookmarklet', pane, 'ember_debug.js'), 'void(0);');
    }
  });

  test('the websocket UI has the remote port placeholder', () => {
    assert.match(
      read('websocket', 'index.html'),
      /<head>\n{{ remote-port }}\n/,
    );
  });

  test('testing has the chrome extension on top of the basic UI', () => {
    for (let file of ['manifest.json', 'background.js', 'content-script.js']) {
      assert.ok(existsSync(join(dist, 'testing', file)), file);
    }

    assert.equal(
      read('testing', PANE, 'ember_debug.js'),
      read('chrome', PANE, 'ember_debug.js'),
    );
  });
});
