import { after, before, describe, test } from 'node:test';
import { checks } from './checks.mjs';
import { apps, assertBuilt } from './paths.mjs';
import { serve } from './serve.mjs';

/**
 * `E2E_BROWSER` picks the browser: chrome, firefox, or safari.
 * Each browser runs as its own CI job.
 */
const browser = process.env.E2E_BROWSER ?? 'chrome';
const { openInspector, requiredDists } = await import(`./${browser}.mjs`);

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
      let skip = check.appliesTo?.(app) === false;
      let todo = check.knownIssue?.(app, browser) || false;

      test(check.name, { skip, todo, timeout: TIMEOUT }, () =>
        check.run({ ...session, app }),
      );
    }
  });
}
