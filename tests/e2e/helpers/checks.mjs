import { setTimeout as sleep } from 'node:timers/promises';

/**
 * The happy paths that every browser runs against every test app.
 *
 * Each check gets a session from a browser driver:
 *
 * - `inspector` drives the inspector UI, in a DevTools panel
 *   or in the bookmarklet window.
 * - `page` drives the app that the inspector inspects.
 *
 * Both have `evaluate(fn, ...args)`, which runs `fn` in the browser.
 * `click(selector, text)` and `hover(selector, text)` act on the first
 * element that matches `selector` and contains `text`.
 *
 * The checks run in order on one session.
 * The check that reloads the page comes last.
 * `appliesTo(app, browser)` and `knownIssue(app, browser)` are optional.
 */
export const checks = [
  {
    name: 'the Info tab lists the Ember version',
    async run({ inspector, app }) {
      await openTab(inspector, 'Info');

      await waitForText(
        inspector,
        '.js-library-row',
        `Ember${app.emberVersion}`,
      );
    },
  },

  {
    name: 'the App Config tab shows the app config',
    async run({ inspector, app }) {
      await openTab(inspector, 'Info');
      await inspector.click('a', 'App Config');

      await waitForText(inspector, '.js-config-row', `modulePrefix${app.name}`);
    },
  },

  {
    name: 'the Components tab shows the component tree and its properties',
    async run({ inspector, page }) {
      await openTab(inspector, 'Components');
      await waitForText(inspector, '.component-tree-item', 'Counter@clicks={{1}}');

      await inspector.click('.component-tree-item', 'Counter');
      await waitForText(inspector, '[data-test-object-property]', 'added:0');

      /**
       * A user's pointer leaves the tree on the way to the page.
       * The selected component stays pinned in the page,
       * and the first click on the page only removes the pin.
       */
      await inspector.hover('a.nav-item', 'Components');
      await page.click('h1');
      await page.click('button', 'Clicks');
      await waitForText(page, 'button', 'Clicks:2');
      await waitForText(inspector, '[data-test-object-property]', 'added:1');
    },
  },

  {
    name: 'the Routes tab shows the routes and follows the current route',
    async run({ inspector, page }) {
      await openTab(inspector, 'Routes');
      await waitForText(inspector, '.js-route-name', 'about');
      await waitForText(inspector, '.js-route-name.pill-blue', 'index');

      await page.click('a', 'About');
      await waitForText(inspector, '.js-route-name.pill-blue', 'about');

      await page.click('a', 'Home');
      await waitForText(inspector, '.js-route-name.pill-blue', 'index');
    },
  },

  {
    name: 'the Data tab shows the model types and their records',
    appliesTo: (app) => app.hasData,
    async run({ inspector }) {
      await openTab(inspector, 'Data');
      await waitForText(inspector, '.js-model-type', 'post2');

      await inspector.click('.js-model-type a', 'post');
      await waitForText(inspector, '[data-test-table-row]', '"First post"');
      await waitForText(inspector, '[data-test-table-row]', '"Second post"');
    },
  },

  {
    name: 'the Deprecations tab shows a deprecation from the app',
    async run({ inspector, page }) {
      await openTab(inspector, 'Deprecations');

      await page.click('button', 'Log a deprecation');
      await waitForText(
        inspector,
        '[data-test-deprecation-message]',
        'The test app logged a deprecation.',
      );
    },
  },

  {
    name: 'the Container tab lists the instances of a type',
    async run({ inspector }) {
      await openTab(inspector, 'Container');
      await waitForText(inspector, '.js-container-type', 'route');

      await inspector.click('.js-container-type a', 'route');
      await waitForText(inspector, '[data-test-instance-row]', 'application');
      await waitForText(inspector, '[data-test-instance-row]', 'index');
    },
  },

  {
    name: 'the Promises tab shows the promises of a transition',
    async run({ inspector, page }) {
      await openTab(inspector, 'Promises');

      await page.click('a', 'About');
      await waitForText(inspector, '.js-promise-tree-item', 'Fulfilled');

      await page.click('a', 'Home');
    },
  },

  {
    name: 'the Render Performance tab shows the render of a navigation',
    knownIssue: (app, browser) =>
      browser !== 'safari' &&
      'the tab can stop getting new renders, always in a Vite app',
    async run({ inspector, page }) {
      await openTab(inspector, 'Render Performance');
      let before = await count(inspector, '.js-render-profile-item');

      await page.click('a', 'About');
      await waitForText(page, 'h2', 'About');
      await waitForCount(inspector, '.js-render-profile-item', before + 1);

      await page.click('a', 'Home');
    },
  },

  {
    name: 'the inspector shows the new page after its Reload button',
    /**
     * Nothing runs the bookmarklet again after a reload,
     * so the bookmarklet window loses the page.
     */
    appliesTo: (app, browser) => browser !== 'safari',
    knownIssue: () => 'the inspector can lose the page after a reload',
    async run({ inspector, page }) {
      await openTab(inspector, 'Promises');
      await reloadFrom(
        inspector,
        page,
        '.js-page-refresh-btn, .js-toolbar-page-refresh-btn',
      );

      /**
       * An earlier check clicked the counter.
       * The reloaded page starts again at zero.
       */
      await openTab(inspector, 'Components');
      await waitForText(inspector, '.component-tree-item', 'Counter');
      await inspector.click('.component-tree-item', 'Counter');
      await waitForText(inspector, '[data-test-object-property]', 'added:0');
    },
  },
];

/**
 * Clicks a reload button in the inspector,
 * then waits until the app renders again in a new document.
 */
async function reloadFrom(inspector, page, selector) {
  await page.evaluate(() => (window.beforeE2EReload = true));

  try {
    await inspector.click(selector);
  } catch (error) {
    /**
     * The inspector can reload with the page
     * before the click returns.
     */
    if (!/destroyed|detached/.test(error.message)) throw error;
  }

  for (let start = Date.now(); Date.now() - start < 15_000; ) {
    try {
      let reloaded = await page.evaluate(
        () => !window.beforeE2EReload && !!document.querySelector('nav a'),
      );
      if (reloaded) return;
    } catch {
      /**
       * The old document can go away during the check.
       */
    }

    await sleep(250);
  }

  throw new Error('the page did not reload');
}

function count(driver, selector) {
  return driver.evaluate((s) => document.querySelectorAll(s).length, selector);
}

async function waitForCount(driver, selector, expected, timeout = 15_000) {
  let actual = 0;

  for (let start = Date.now(); Date.now() - start < timeout; ) {
    try {
      actual = await count(driver, selector);
      if (actual >= expected) return;
    } catch {
      /**
       * The document can be between pages.
       */
    }

    await sleep(250);
  }

  throw new Error(
    `expected ${expected} ${selector} after ${timeout}ms, found ${actual}`,
  );
}

async function openTab(inspector, label) {
  await waitForText(inspector, 'a.nav-item', label);
  await inspector.click('a.nav-item', label);
}

/**
 * Waits until an element that matches `selector` contains `text`.
 * Whitespace does not count, so `added:1` matches `added : 1`.
 */
export async function waitForText(driver, selector, text, timeout = 15_000) {
  let expected = text.replace(/\s+/g, '');
  let texts = [];

  for (let start = Date.now(); Date.now() - start < timeout; ) {
    try {
      texts = await driver.evaluate(
        (s) =>
          Array.from(document.querySelectorAll(s), (element) =>
            element.textContent.replace(/\s+/g, ''),
          ),
        selector,
      );

      if (texts.some((actual) => actual.includes(expected))) return;
    } catch {
      /**
       * The document can be between pages after a reload.
       */
    }

    await sleep(250);
  }

  throw new Error(
    `no ${selector} contains "${text}" after ${timeout}ms. Found: ${JSON.stringify(texts.slice(0, 10))}`,
  );
}
