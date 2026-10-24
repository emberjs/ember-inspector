import { setTimeout as sleep } from 'node:timers/promises';
import { centerOf, findElement } from './find.mjs';
import { startFirefox } from './marionette.mjs';
import { dists } from './paths.mjs';

export const requiredDists = [dists.firefox];

const ELEMENT = 'element-6066-11e4-a52e-4f735466cecf';

const DEVTOOLS = `
  const { require } = ChromeUtils.importESModule(
    'resource://devtools/shared/loader/Loader.sys.mjs',
  );
  const { gDevTools } = require('devtools/client/framework/devtools');
`;

export const OPEN_DEVTOOLS = `
  const done = arguments[arguments.length - 1];
  ${DEVTOOLS}
  gDevTools.showToolboxForTab(gBrowser.selectedTab).then(
    () => done(true),
    (error) => done(String(error)),
  );
`;

export const SELECT_EMBER_PANEL = `
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

/**
 * Finds the <browser> element that shows the inspector in the Ember panel.
 * The inspector runs in the extension process, so chrome code
 * cannot read its document directly.
 */
const PANE = `
  ${DEVTOOLS}
  const toolbox = gDevTools.getToolboxForTab(gBrowser.selectedTab);
  let pane = null;
  const visit = (doc) => {
    for (const frame of doc.querySelectorAll('browser, iframe')) {
      const src = frame.currentURI?.spec ?? frame.src;
      if (src?.includes('/panes-')) pane = frame;
      else if (frame.contentDocument) visit(frame.contentDocument);
    }
  };
  if (toolbox) visit(toolbox.doc);
`;

export const PANE_URL = `
  const done = arguments[arguments.length - 1];
  ${PANE}
  done(pane?.currentURI?.spec ?? null);
`;

/**
 * Marionette registers its command actor in every frame,
 * including the frames of the extension process.
 * Its parent side runs scripts and synthesizes input in the inspector.
 */
const PANE_COMMAND = `
  const [command, params, done] = arguments;
  ${PANE}
  const actor = pane?.browsingContext.currentWindowGlobal?.getActor(
    'MarionetteCommands',
  );
  if (!actor) {
    done({ error: 'the Ember panel has no inspector' });
  } else {
    const run =
      command === 'evaluate'
        ? actor.executeScript(params.script, params.args, {})
        : actor.dispatchEvent('synthesizeMouseAtPoint', params);
    run.then(
      (value) => done({ value }),
      (error) => done({ error: String(error) }),
    );
  }
`;

/**
 * Opens the app in Firefox with the built Firefox extension installed
 * as a temporary add-on, then opens DevTools and selects the Ember panel.
 */
export async function openInspector(appUrl) {
  let firefox = await startFirefox();
  let { client } = firefox;

  try {
    await client.send('WebDriver:SetWindowRect', { width: 1600, height: 1200 });
    await client.send('Addon:Install', { path: dists.firefox, temporary: true });
    await client.send('WebDriver:Navigate', { url: appUrl });

    if ((await client.inChrome(OPEN_DEVTOOLS)) !== true) {
      throw new Error('Firefox DevTools did not open');
    }

    if ((await client.inChrome(SELECT_EMBER_PANEL)) !== true) {
      throw new Error('Firefox DevTools has no Ember panel');
    }

    let inspector = paneDriver(client);
    await waitForInspector(inspector);

    return {
      page: pageDriver(client),
      inspector,
      close: () => firefox.stop(),
    };
  } catch (error) {
    await firefox.stop();
    throw error;
  }
}

async function waitForInspector(inspector) {
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      if (await inspector.evaluate(() => !!document.querySelector('.nav-item'))) {
        return;
      }
    } catch {
      /**
       * The panel has no document yet.
       */
    }

    await sleep(250);
  }

  throw new Error('the Ember panel did not load the inspector');
}

function paneDriver(client) {
  async function command(name, params) {
    let result = await client.inChrome(PANE_COMMAND, [name, params]);
    if (result.error) throw new Error(result.error);
    return result.value;
  }

  function evaluate(fn, ...args) {
    return command('evaluate', { script: `return (${fn})(...arguments)`, args });
  }

  async function pointer(selector, text, eventData) {
    let point = await evaluate(centerOf, selector, text);

    if (!point) {
      throw new Error(`no element matches ${selector} "${text ?? ''}"`);
    }

    await command('mouse', { ...point, eventData });
  }

  return {
    evaluate,
    click: (selector, text) => pointer(selector, text, {}),
    hover: (selector, text) =>
      pointer(selector, text, { type: 'mousemove' }),
  };
}

function pageDriver(client) {
  async function evaluate(fn, ...args) {
    let result = await client.send('WebDriver:ExecuteScript', {
      script: `return (${fn})(...arguments)`,
      args,
    });

    return result.value;
  }

  async function find(selector, text) {
    let element = await evaluate(findElement, selector, text);

    if (!element) {
      throw new Error(`no element matches ${selector} "${text ?? ''}"`);
    }

    return element;
  }

  return {
    evaluate,

    async click(selector, text) {
      let element = await find(selector, text);
      await client.send('WebDriver:ElementClick', { id: element[ELEMENT] });
    },

    async hover(selector, text) {
      let element = await find(selector, text);
      await client.send('WebDriver:PerformActions', {
        actions: [
          {
            type: 'pointer',
            id: 'mouse',
            actions: [{ type: 'pointerMove', origin: element, x: 0, y: 0 }],
          },
        ],
      });
    },
  };
}
