# Ember Inspector [![Build Status](https://github.com/emberjs/ember-inspector/workflows/Build%20and%20Publish/badge.svg?branch=main)](https://github.com/emberjs/ember-inspector/actions?query=branch%3Amain+workflow%3A%22Build+and+Publish%22)

Adds an Ember tab to the browser's Developer Tools that allows you to inspect
Ember objects in your application.

## Installation

### Chrome

Install the extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi).

OR:

- Clone the repository
- cd into the repo directory
- run `pnpm add -g ember-cli`
- run `pnpm install`
- run `pnpm build` to build the `dist` directory
- Visit `chrome://extensions` in Chrome
- Make sure `Developer mode` is checked
- Click on 'Load unpacked extension...'
- Choose the `dist/chrome` folder in the cloned repo
- Close and re-open developer tools if it's already open

### Firefox

Install the [Firefox addon](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/).

OR:

- Clone the repository
- cd into the repo directory
- run `pnpm add -g ember-cli`
- run `pnpm install`
- run `pnpm build` to build the `dist` directory
- Visit `about:debugging#/runtime/this-firefox` in Firefox
- Click on 'Load Temporary Add-on…'
- Choose the `dist/firefox/manifest.json` file in the cloned repo

### Opera

- Clone the repository
- cd into the repo directory
- run `pnpm add -g ember-cli`
- run `pnpm install`
- run `pnpm build` to build the `dist` directory
- Visit `chrome://extensions` in Opera
- Make sure `Developer mode` is checked
- Click on 'Load unpacked extension...'
- Choose the `dist/chrome` folder in the cloned repo
- Close and re-open developer tools if it's already open

### Bookmarklet (All Browsers)

```javascript
javascript: (function() { var s = document.createElement('script'); s.src = '//ember-extension.s3.amazonaws.com/dist_bookmarklet/load_inspector.js'; document.body.appendChild(s); }());
```

Internet explorer will open an iframe instead of a popup due to the lack of support for cross-origin messaging.

For development:

- In a terminal:
  - run `pnpm serve:bookmarklet`
- In your browser:
  - If Ember Inspector is installed as an active extension, deactivate it
  - Visit the Ember app you want to inspect
  - Open the developer tool console and execute the following (make sure you unblock the popup when you run the bookmarklet):

```javascript
javascript: (function() { var s = document.createElement('script'); s.src = 'http://localhost:9191/bookmarklet/load_inspector.js'; document.body.appendChild(s); }());
```

Or to do this more easily in the future, create a new bookmark in your browser, and copy the above script as the URL.

The expected behavior is a new window opening with the URL `http://localhost:9191/bookmarklet/<pane-root>/index.html?inspectedWindowURL=<inspected-app-url>`, running your local ember-inspector. The content should be the same as the one you see when using the published extension, but not properly styled.

### Vite Support

If your Ember app is running on Vite, you may need [@embroider/legacy-inspector-support](https://github.com/embroider-build/embroider/tree/main/packages/legacy-inspector-support) to get things working in your app.

### Window Messages

The Ember Inspector uses window messages, so if you are using window messages in your application code, make sure you [verify the sender](https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage#Security_concerns) and add checks to your event listener so as not to conflict with the inspector's messages.


## Development

Want to work on inspector? See [DEVELOPMENT.md](./DEVELOPMENT.md)