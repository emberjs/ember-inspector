# Ember Inspector [![Build Status](https://secure.travis-ci.org/emberjs/ember-inspector.svg?branch=master)](https://travis-ci.org/emberjs/ember-inspector)

Adds an Ember tab to the browser's Developer Tools that allows you to inspect
Ember objects in your application.

## Installation

### Chrome

Install the extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi).

OR:

- Clone the repository
- cd into the repo directory
- run `yarn install && bower install`
- run `yarn global add ember-cli`
- run `yarn run build` to build the `dist` directory
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
- run `yarn install && bower install`
- run `yarn global add ember-cli`
- run `yarn run build` to build the `dist` directory
- Visit `about:debugging` in Firefox
- Click on 'Load Temporary Addon-on'
- Choose the `dist/firefox/manifest.json` file in the cloned repo

### Opera

- Clone the repository
- cd into the repo directory
- run `yarn install && bower install`
- run `yarn global add ember-cli`
- run `yarn run build` to build the `dist` directory
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

- run `yarn run serve:bookmarklet`
- create a bookmark (make sure you unblock the popup when you run the bookmarklet):

```javascript
javascript: (function() { var s = document.createElement('script'); s.src = 'http://localhost:9191/bookmarklet/load_inspector.js'; document.body.appendChild(s); }());
```

## Building and Testing:

Run `yarn install && yarn global add ember-cli && yarn global add bower && bower install && grunt-cli` to install the required modules.

- `yarn run build` to build the files in the `dist` directory
- `yarn run watch` To watch the files and re-build in `dist` when anything changes (useful during development).
- `yarn test` To run the tests in the terminal
- `yarn start` To start the test server at `localhost:4200/testing/tests`


## Deploy new version:

#### Patch versions

Patch versions are only committed to the stable branch. So we need to cherry-pick the commits we need from master and bump stable to the new patch version.

- `git checkout stable`
- Cherry-pick the needed commits from master to stable
- Bump the patch version in `package.json`. Add the change log entry and commit.
- Follow the "Steps to publish" below.
- `git checkout master`
- Commit the change log entry to the master branch.

#### Minor and major versions

When releasing a major/minor version, master would already have this version set, so what we need to do is to merge master into stable and release.

- Add the new minor/major version's change log entry in `CHANGELOG.md` and commit to master.
- `git checkout stable`
- `git merge -X theirs master`
- Follow the "Steps to publish" steps below.
- `git checkout master`
- Update `package.json` to the future major/minor version.

#### Steps to publish

- Push the `stable` branch to github (this will publish the bookmarklet version).
- `yarn run build:production`
- `git tag` the new version
- Follow the "Publishing to Chrome" steps
- Follow the "Publishing to Firefox" steps
- `npm publish ./`

##### Publishing to Chrome

- Make sure you have the correct credentials to publish to Chrome.
- Sign in to the [Chrome Webstore](https://chrome.google.com/webstore)
- Click on Settings -> Developer dashboard
- Click on "Edit" next to "Ember Inspector"
- Click on Upload Updated Package
- Click on "Choose file"
- Choose the file `dist/chrome/ember-inspector.zip`
- Click "Upload"
- Click "Save and publish changes"

##### Publishing to Firefox

- Make sure you have the correct credentials to publish to Firefox.
- Sign in to the [Mozilla Addons Site](https://addons.mozilla.org)
- Click on Tools -> Manage My Submissions
- Click on "New Version" below "Ember Inspector"
- Click on "Select a file"
- Choose the file `dist/firefox/ember-inspector.zip`
- Follow the steps to publish

### Locking a version

We can take a snapshot of the current inspector version to support a specific Ember version range. This allows us to stop supporting old Ember versions in master without breaking the published inspector for old Ember apps. It works by serving a different inspector version based on the current app's Ember version.

The Ember versions supported by the current inspector are indicated in the `emberVersionsSupported` array in `package.json`.

Here are the steps to lock an inspector version:

- Update `package.json`'s `emberVersionsSupported`: add a second element that indicates the minimum Ember version this inspector *does not* support.
- Release a new version (See "Minor and major versions"). Create a branch for this version.
- Run `yarn run lock-version`. This will build, compress, and upload this version to S3.
- Update `package.json`'s `previousEmberVersionsSupported`: add the first Ember version supported by the recently locked version (the first element in the `emberVersionsSupported` array).
- Update `package.json`'s `emberVersionsSupported`: Move the second element in the array to the first position. Add an empty string as the second element to indicate there's currently no maximum Ember version supported yet.
- Commit.

### Window Messages

The Ember Inspector uses window messages, so if you are using window messages in your application code, make sure you [verify the sender](https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage#Security_concerns) and add checks to your event listener so as not to conflict with the inspector's messages.
