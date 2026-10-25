import { setTimeout as sleep } from 'node:timers/promises';
import { dists } from './paths.mjs';
import { serve } from './serve.mjs';
import { startSession } from './webdriver.mjs';

export const requiredDists = [dists.bookmarklet];

/**
 * Opens the app in Safari and runs the bookmarklet,
 * which is how Safari users open the inspector.
 * The bookmarklet opens the inspector in a popup window.
 *
 * `WEBDRIVER` runs the same steps with another WebDriver server,
 * such as `chromedriver`, to work on this driver without a Mac.
 * `WEBDRIVER_CAPABILITIES` gives that server its capabilities as JSON.
 */
export async function openInspector(appUrl) {
  let inspectorServer = await serve(dists.bookmarklet);
  let session;

  try {
    session = process.env.WEBDRIVER
      ? await startSession(
          process.env.WEBDRIVER,
          JSON.parse(process.env.WEBDRIVER_CAPABILITIES ?? '{}'),
          (port) => [`--port=${port}`],
        )
      : await startSession('safaridriver', { browserName: 'safari' }, (port) => [
          '--port',
          String(port),
        ]);

    await session.send('POST', '/window/rect', { width: 1600, height: 1200 });
    await session.send('POST', '/url', { url: appUrl });

    let [pageWindow] = await session.windows();
    session.currentWindow = pageWindow;

    await runBookmarklet(session, `${inspectorServer.url}load_inspector.js`);

    let inspectorWindow = await waitForPopup(session, pageWindow);
    let inspector = session.driver(inspectorWindow);
    await waitForInspector(inspector);

    return {
      page: session.driver(pageWindow),
      inspector,
      screenshots: async () => ({
        page: await session.screenshot(pageWindow),
        inspector: await session.screenshot(inspectorWindow),
      }),
      async close() {
        await session.close();
        await inspectorServer.close();
      },
    };
  } catch (error) {
    await session?.close();
    await inspectorServer.close();
    throw error;
  }
}

/**
 * Runs the bookmarklet from the README, with the local build as its source.
 */
async function runBookmarklet(session, src) {
  await session.send('POST', '/execute/sync', {
    script: `
      var s = document.createElement('script');
      s.src = arguments[0];
      document.body.appendChild(s);
    `,
    args: [src],
  });
}

async function waitForPopup(session, pageWindow) {
  for (let attempt = 0; attempt < 80; attempt++) {
    let popup = (await session.windows()).find(
      (handle) => handle !== pageWindow,
    );
    if (popup) return popup;
    await sleep(250);
  }

  throw new Error(
    'the bookmarklet did not open the inspector. Check that the browser allows popups.',
  );
}

async function waitForInspector(inspector) {
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      let ready = await inspector.evaluate(
        () => !!document.querySelector('.nav-item'),
      );
      if (ready) return;
    } catch {
      /**
       * The popup has no document yet.
       */
    }

    await sleep(250);
  }

  throw new Error('the bookmarklet window did not load the inspector');
}
