import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { startFirefox } from './firefox.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const extension = join(root, 'packages/ember-inspector/dist/firefox');
const testApp = join(root, 'packages/vite-test-app/dist');

const TIMEOUT = 120_000;

const DEVTOOLS = `
  const { require } = ChromeUtils.importESModule(
    'resource://devtools/shared/loader/Loader.sys.mjs',
  );
  const { gDevTools } = require('devtools/client/framework/devtools');
`;

const OPEN_DEVTOOLS = `
  const done = arguments[arguments.length - 1];
  ${DEVTOOLS}
  gDevTools.showToolboxForTab(gBrowser.selectedTab).then(
    () => done(true),
    (error) => done(String(error)),
  );
`;

const SELECT_EMBER_PANEL = `
  const done = arguments[arguments.length - 1];
  ${DEVTOOLS}
  const toolbox = gDevTools.getToolboxForTab(gBrowser.selectedTab);
  (async () => {
    for (let attempt = 0; attempt < 80; attempt++) {
      const [ember] = toolbox.additionalToolDefinitions.keys();
      if (ember) {
        await toolbox.selectTool(ember);
        return done(true);
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    done(false);
  })();
`;

const PANE_URL = `
  const done = arguments[arguments.length - 1];
  ${DEVTOOLS}
  const toolbox = gDevTools.getToolboxForTab(gBrowser.selectedTab);
  let url = null;
  const visit = (doc) => {
    for (const frame of doc.querySelectorAll('browser, iframe')) {
      const src = frame.currentURI?.spec ?? frame.src;
      if (src?.includes('/panes-')) url = src;
      if (frame.contentDocument) visit(frame.contentDocument);
    }
  };
  visit(toolbox.doc);
  done(url);
`;

const EXTENSION_ERRORS = `
  const done = arguments[arguments.length - 1];
  const errors = [];
  for (const message of Services.console.getMessageArray() ?? []) {
    /**
     * Uncaught promise errors have no source name.
     * Their text names the file instead.
     */
    const text = String(message.errorMessage ?? message.message ?? message);
    if ((message.sourceName ?? text).includes('moz-extension://')) {
      errors.push(text);
    }
  }
  done(errors);
`;

let server;
let appUrl;

before(async () => {
  for (let dist of [extension, testApp]) {
    if (!existsSync(dist)) {
      throw new Error(`${dist} is missing. Run \`pnpm build\` first.`);
    }
  }

  server = createServer((request, response) => {
    let path = join(testApp, new URL(request.url, 'http://x').pathname);
    if (!existsSync(path) || !extname(path)) {
      path = join(testApp, 'index.html');
    }

    let types = { '.js': 'text/javascript', '.css': 'text/css' };
    response.setHeader('Content-Type', types[extname(path)] ?? 'text/html');
    response.end(readFileSync(path));
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  appUrl = `http://127.0.0.1:${server.address().port}/`;
});

after(() => server?.close());

async function waitFor(check, message) {
  for (let attempt = 0; attempt < 120; attempt++) {
    let value = await check();
    if (value) return value;
    await sleep(250);
  }

  throw new Error(message);
}

test('the Ember panel detects the app', { timeout: TIMEOUT }, async () => {
  let firefox = await startFirefox();
  let { client } = firefox;

  try {
    await client.send('Addon:Install', { path: extension, temporary: true });
    await client.send('WebDriver:Navigate', { url: appUrl });

    assert.equal(await client.inChrome(OPEN_DEVTOOLS), true);
    assert.equal(await client.inChrome(SELECT_EMBER_PANEL), true);

    /**
     * The panel leaves its start page for the Info tab
     * only after ember-debug reports the app.
     */
    await waitFor(async () => {
      let url = await client.inChrome(PANE_URL);
      return url?.includes('#/info/');
    }, 'the Ember panel did not detect the app');
  } finally {
    await firefox.stop();
  }
});

test(
  'a panel on a page without a content script logs no errors',
  { timeout: TIMEOUT },
  async () => {
    let firefox = await startFirefox();
    let { client } = firefox;

    try {
      /**
       * Content scripts do not run on about: pages.
       * This is where a temporary add-on is loaded.
       */
      await client.send('WebDriver:Navigate', {
        url: 'about:debugging#/runtime/this-firefox',
      });
      assert.equal(await client.inChrome(OPEN_DEVTOOLS), true);
      await client.send('Addon:Install', { path: extension, temporary: true });
      assert.equal(await client.inChrome(SELECT_EMBER_PANEL), true);

      await waitFor(
        () => client.inChrome(PANE_URL),
        'the Ember panel did not load',
      );

      /**
       * The panel sends its first messages right after it loads.
       * Nothing reports that the sends failed, so give them time.
       */
      await sleep(3000);

      let errors = await client.inChrome(EXTENSION_ERRORS);
      assert.deepEqual(
        errors.filter((error) => error.includes('Receiving end')),
        [],
        errors.join('\n'),
      );
    } finally {
      await firefox.stop();
    }
  },
);
