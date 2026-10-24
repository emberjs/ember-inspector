# End-to-end tests

These tests install the built inspector in a real browser, the way users get it. Then they inspect the test apps in `packages/vite-test-app` and `packages/classic-test-app`.

```sh
pnpm test:e2e:build
E2E_BROWSER=chrome pnpm test:e2e
```

`E2E_BROWSER` is `chrome`, `firefox`, or `safari`. CI runs one job for each browser. The Safari job runs on macOS.

## Files

| File | What it does |
| --- | --- |
| `checks.mjs` | The happy paths. Every browser runs all of them against every test app. |
| `inspector-test.mjs` | Runs the checks for the browser in `E2E_BROWSER`. |
| `chrome.mjs`, `firefox.mjs`, `safari.mjs` | One driver for each browser. Each one opens the inspector and gives the checks a `page` and an `inspector`. |
| `firefox-test.mjs` | Tests that only apply to Firefox. |
| `marionette.mjs`, `webdriver.mjs` | Clients for the Firefox and WebDriver protocols. |

A driver gives the checks the same three functions for the page and for the inspector: `evaluate(fn, ...args)`, `click(selector, text)`, and `hover(selector, text)`. A new check goes in `checks.mjs`. It must not know which browser it runs in.

## Why each browser uses a different tool

The inspector UI runs in a DevTools panel, and WebDriver cannot see DevTools. Each browser needs a tool that can install the real extension and also reach that panel. No single tool can do both in all three browsers.

### Chrome: Puppeteer

Puppeteer installs `dist/chrome` as an unpacked extension, as a developer does. It also gives access to the DevTools window, where the Ember panel is.

We do not use Playwright here. Playwright does not expose the DevTools window.

The driver docks DevTools at the bottom, so the panel gets the full window width. At the default width, the object inspector covers the lists in the panel.

### Firefox: Marionette

Marionette is the automation protocol that is built into Firefox. It installs `dist/firefox` as a temporary add-on in the Firefox that users run.

We do not use Playwright here either. Playwright drives its own patched Firefox build through its own protocol, and that build cannot install extensions.

The panel runs in the extension process, so code in the browser chrome cannot read its document. The driver uses the Marionette command actor, which Firefox registers in every frame, the extension frames too. These two approaches do not work:

- The `extensions.webextensions.remote=false` pref. With it, Firefox cannot load DevTools panels from extensions.
- A JSWindowActor of our own. Its module never loads in the extension process.

### Safari: the bookmarklet

The inspector has no Safari extension. Safari users open it with the bookmarklet from the README, so the Safari driver runs that bookmarklet from `dist/bookmarklet`.

Playwright's WebKit is not Safari, so the driver uses `safaridriver`, which drives the Safari that users run. Safari has no WebDriver BiDi, so the driver uses classic W3C WebDriver.

The bookmarklet opens the inspector in a popup. The README tells users to allow popups, and the CI job allows them too.

To work on this driver without a Mac, run it with another WebDriver server:

```sh
E2E_BROWSER=safari \
WEBDRIVER=/path/to/chromedriver \
WEBDRIVER_CAPABILITIES='{"goog:chromeOptions":{"binary":"/path/to/chrome","args":["--headless=new"]}}' \
pnpm test:e2e
```

## Things that the checks must handle

- If you select a component, the inspector pins a highlight and a tooltip on the page. The next click on the page outside the tooltip only removes the pin. Real users get this behavior too.
- Puppeteer keeps the pointer of the inspector over the last element that it clicked. A real pointer leaves the panel before it clicks the page. If you do not move it away, the inspector keeps a highlight over the component.
- Render Performance hides renders that take less than 1 ms. The `about` route of each test app takes 5 ms, so that a render always shows.
- WebDriver sends an `undefined` argument as `null`.

## Known issues

A check with `knownIssue` runs as a `todo`. It reports its result, but it does not fail the job.

- In `vite-test-app`, the Chrome and Firefox extensions record no renders in Render Performance. The bookmarklet records them. The classic app records them in all browsers.
