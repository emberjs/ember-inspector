import puppeteer from 'puppeteer';
import { setTimeout as sleep } from 'node:timers/promises';
import { findElement } from './find.mjs';
import { dists } from './paths.mjs';

export const requiredDists = [dists.chrome];

/**
 * Opens the app in Chrome with the built Chrome extension installed,
 * then opens DevTools and selects the Ember panel.
 *
 * Puppeteer installs the extension unpacked, as a developer does.
 * It also exposes the DevTools window, which the panel lives in.
 */
export async function openInspector(appUrl) {
  let browser = await puppeteer.launch({
    headless: process.env.HEADLESS !== 'false',
    pipe: true,
    enableExtensions: [dists.chrome],
    devtools: true,
    defaultViewport: null,
    args: ['--window-size=1600,1200'],
  });

  try {
    let [page] = await browser.pages();
    await page.goto(appUrl);

    let devtools = await (
      await browser.waitForTarget((target) =>
        target.url().startsWith('devtools://'),
      )
    ).asPage();

    await selectEmberPanel(devtools);

    let pane = await waitForPane(devtools);

    return {
      page: frameDriver(page.mainFrame()),
      inspector: frameDriver(pane),
      close: () => browser.close(),
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

/**
 * Docks DevTools at the bottom, so the panel gets the full window width,
 * then selects the Ember panel.
 */
async function selectEmberPanel(devtools) {
  await devtools.evaluate(async () => {
    let { DockController } = await import('./ui/legacy/legacy.js');
    DockController.DockController.instance().setDockSide('bottom');
  });

  for (let attempt = 0; attempt < 80; attempt++) {
    let selected = await devtools.evaluate(async () => {
      let { InspectorView } = await import('./ui/legacy/legacy.js');
      let view = InspectorView.InspectorView.instance();
      let ember = view.tabbedPane
        .tabIds()
        .find((id) => id.startsWith('chrome-extension://'));

      if (!ember) return false;

      await view.showPanel(ember);
      return true;
    });

    if (selected) return;
    await sleep(250);
  }

  throw new Error('Chrome DevTools has no Ember panel');
}

async function waitForPane(devtools) {
  for (let attempt = 0; attempt < 80; attempt++) {
    let pane = devtools.frames().find((frame) => frame.url().includes('/panes-'));
    if (pane) return pane;
    await sleep(250);
  }

  throw new Error('the Ember panel did not load the inspector');
}

function frameDriver(frame) {
  return {
    evaluate: (fn, ...args) => frame.evaluate(fn, ...args),

    click: (selector, text) => withElement(frame, selector, text, 'click'),
    hover: (selector, text) => withElement(frame, selector, text, 'hover'),
  };
}

/**
 * Retries when the inspector re-renders the element
 * between finding it and acting on it.
 */
async function withElement(frame, selector, text, action) {
  for (let attempt = 1; ; attempt++) {
    let handle = await frame.evaluateHandle(findElement, selector, text);
    let element = handle.asElement();

    try {
      if (!element) {
        throw new Error(`no element matches ${selector} "${text ?? ''}"`);
      }

      return await element[action]();
    } catch (error) {
      if (attempt === 5 || !/detached/.test(error.message)) throw error;
    } finally {
      await handle.dispose().catch(() => {});
    }

    await sleep(100);
  }
}
