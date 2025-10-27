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