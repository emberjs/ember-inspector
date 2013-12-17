Ember Extension [![Build Status](https://secure.travis-ci.org/tildeio/ember-extension.png?branch=master)](http://travis-ci.org/tildeio/ember-extension)
===============

Adds an Ember tab to Chrome or Firefox Developer Tools that allows you to inspect
Ember objects in your application.

Installation
------------

### Chrome

Install the extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi).

OR:

- Clone the repository
- cd into the repo directory
- run `npm install`
- run `npm install -g grunt-cli`
- run `grunt` to build the `dist_chrome` directory
- Visit chrome://extensions in chrome
- Make sure `Developer mode` is checked
- Click on 'Load unpacked extension...'
- Choose the `dist_chrome` folder in the cloned repo
- Close and re-open developer tools if it's already open

### Firefox

Install the [Firefox addon](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/).

OR:

- Clone the repository
- cd into the repo directory
- run `npm install`
- run `npm install -g grunt-cli`
- run `grunt build build_xpi` to build the `dist_firefox` directory, download Firefox Addon SDK and build Firefox Addon XPI to 'tmp/xpi/ember-inspector.xpi'
  or `grunt run_xpi` to run the Firefox Addon in a temporary profile (or use `FIREFOX_BIN` and `FIREFOX_PROFILE` to customize Firefox profile directory and Firefox binary used to run the extension)

Building and Testing:
--------------------

Run `npm install` to install the required modules.

- `grunt` to build the files in the `dist_chrome` and `dist_firefox` directories
- `grunt test` To run the tests in the terminal
- `grunt build build_xpi` to download and build Firefox Addon XPI into `tmp/xpi/exber-inspector.xpi`
- `grunt run_xpi` to run the Firefox Addon XPI on a temporary new profile (or use `FIREFOX_BIN` and `FIREFOX_PROFILE` to customize Firefox profile directory and Firefox binary used to run the extension)
- `grunt server` To start the test server at `localhost:9292`
- `grunt watch` To watch the files and re-build when anything changes (useful during development).


[s3-builds]: http://ember-extension.s3-website-us-east-1.amazonaws.com/
[latest-build]: http://ember-extension.s3-website-us-east-1.amazonaws.com/ember-extension-latest.zip
