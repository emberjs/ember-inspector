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

- Or to do this more easily in the future, create a new bookmark in your browser, and copy the above script as the URL.

The expected behavior is a new window opening with the URL `http://localhost:9191/bookmarklet/<pane-root>/index.html?inspectedWindowURL=<inspected-app-url>`, running your local ember-inspector. The content should be the same as the one you see when using the published extension, but not properly styled.

## Building and Testing:

Run `pnpm install && pnpm add -g ember-cli` to install the required modules.

- `pnpm build` to build the files in the `dist` directory
- `pnpm watch` To watch the files and re-build in `dist` when anything changes (useful during development).
- `pnpm test` To run the tests in the terminal
- `pnpm start` To start the test server at `localhost:4200/testing/tests`


## Deploy new version:

See [RELEASE.md](./RELEASE.md)


### Locking a version

We can take a snapshot of the current inspector version to support a specific Ember version range. This allows us to stop supporting old Ember versions in main without breaking the published inspector for old Ember apps. It works by serving a different inspector version based on the current app's Ember version.

The Ember versions supported by the current inspector are indicated in the `emberVersionsSupported` array in `package.json`.

Here are the steps to lock an inspector version:

- Release a new version (See "Minor and major versions") if there are unreleased commits in `main`. Skip this step if there are not new commits after the last release.
- Makes sure you have a `config/secrets.json` file with the correct AWS credentials to push to S3. You can use `config/secrets.json.sample` as a starting point.
- Create a new branch (from `main`) named after the Ember version range that will be supported by this branch. The min version in the range is the first element in the `emberVersionsSupported` array in `package.json`. The max version in the range is the first version that will *not* be supported. For example, a branch named `ember-0.0.0-2.7.0` means it supports Ember 0.0.0 -> 2.6.0, and a branch named `ember-2.7.0-3.4.0` means it supports Ember 2.7.0 -> Ember 3.3.2.
- Update `package.json`'s `emberVersionsSupported`: add a second element that indicates the minimum Ember version the `main` branch *will not* support.
- Commit the branch.
- Run `pnpm lock-version`. This will build, and compress the panes.
- To upload the panes to GitHub:
  - Create a folder locally with the naming convention `panes-x-x-x`
  - Copy the 3 zip files (chrome.zip, firefox.zip, and bookmarklet.zip) into the folder you just created.
  - Go to https://github.com/emberjs/ember-inspector/upload/panes and drag the folder in to upload it.
- Checkout the `main` branch.
- Update `package.json`'s `previousEmberVersionsSupported`: add the first Ember version supported by the recently locked snapshot (the first element in the `emberVersionsSupported` array).
- Update `package.json`'s `emberVersionsSupported`: Take the last element from `previousEmberVersionsSupported` and set it as the first element in this array. Set an empty string as the second element to indicate there's currently no maximum Ember version supported yet. `emberVersionsSupported` array length should always be `2` indicating a [min, max] range.
- Commit.

##### Example scenario

Below is an example scenario that assumes the current `main` branch supports Ember version 2.7.0+ and we want to lock the version such that `main` will support 3.4.0+. It also assumes the last Ember Inspector version released was 3.9.0.

- Release a new inspector version `3.10.0` if there are unreleased commits in `main`.
- Create a new branch from `main` called `ember-2.7.0-3.4.0`.
- Update `package.json`'s `emberVersionsSupported` from `["2.7.0", ""]` to `["2.7.0", "3.4.0"]`.
- Commit with message "Lock Ember version at 2.7.0-3.4.0" and push the branch.
- Run `pnpm lock-version`.
- Checkout the `main` branch.
- Create a new branch *from main* called `lock-3.4.0` (branch name here is not important).
- Update `package.json`'s `previousEmberVersionsSupported` from `["0.0.0"]` to `["0.0.0", "2.7.0"]`.
- Update `package.json`'s `emberVersionsSupported` from `["2.7.0", ""]` to `["3.4.0", ""]`.
- Commit and open a PR against `main`.

### Window Messages

The Ember Inspector uses window messages, so if you are using window messages in your application code, make sure you [verify the sender](https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage#Security_concerns) and add checks to your event listener so as not to conflict with the inspector's messages.
