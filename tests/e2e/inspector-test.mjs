import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { checks } from './helpers/checks.mjs';
import { apps, assertBuilt, screenshotsDir } from './helpers/paths.mjs';
import { serve } from './helpers/serve.mjs';

/**
 * `E2E_BROWSER` picks the browser: chrome, firefox, or safari.
 * Each browser runs as its own CI job.
 */
const browser = process.env.E2E_BROWSER ?? 'chrome';
const { openInspector, requiredDists } = await import(`./helpers/${browser}.mjs`);

const TIMEOUT = 60_000;

for (let app of apps) {
  describe(`${browser}: ${app.name}`, { timeout: 15 * TIMEOUT }, () => {
    let server;
    let session;

    before(async () => {
      assertBuilt(app.dist, ...requiredDists);

      server = await serve(app.dist);
      session = await openInspector(server.url);
    });

    after(async () => {
      await session?.close();
      await server?.close();
    });

    for (let check of checks) {
      let skip = check.appliesTo?.(app, browser) === false;
      let todo = !skip && (check.knownIssue?.(app, browser) || false);

      test(check.name, { skip, todo, timeout: TIMEOUT }, async () => {
        try {
          await check.run({ ...session, app });
        } catch (error) {
          await saveScreenshots(session, join(browser, app.name, slug(check.name)));
          throw error;
        }
      });
    }
  });
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * CI uploads these files when a job fails.
 * A failure to take a screenshot must not hide the error of the check.
 */
async function saveScreenshots(session, name) {
  let dir = join(screenshotsDir, name);

  try {
    mkdirSync(dir, { recursive: true });

    for (let [window, png] of Object.entries(await session.screenshots())) {
      writeFileSync(join(dir, `${window}.png`), png);
    }
  } catch (error) {
    console.error(`no screenshots for "${name}": ${error.message}`);
  }
}
