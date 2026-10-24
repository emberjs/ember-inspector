import { setTimeout as sleep } from 'node:timers/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OPEN_DEVTOOLS, PANE_URL, SELECT_EMBER_PANEL } from './firefox.mjs';
import { startFirefox } from './marionette.mjs';
import { assertBuilt, dists } from './paths.mjs';

const TIMEOUT = 120_000;

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

async function waitFor(check, message) {
  for (let attempt = 0; attempt < 120; attempt++) {
    let value = await check();
    if (value) return value;
    await sleep(250);
  }

  throw new Error(message);
}

test(
  'a panel on a page without a content script logs no errors',
  {
    timeout: TIMEOUT,
    skip: process.env.E2E_BROWSER !== 'firefox' && 'needs E2E_BROWSER=firefox',
  },
  async () => {
    assertBuilt(dists.firefox);

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
      await client.send('Addon:Install', {
        path: dists.firefox,
        temporary: true,
      });
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
