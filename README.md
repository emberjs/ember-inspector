Ember Extension [![Build Status](https://secure.travis-ci.org/tildeio/ember-extension.png?branch=master)](http://travis-ci.org/tildeio/ember-extension)
===============

Adds an Ember tab to chrome dev tools that allows you to inspect
Ember objects in your application.

Installation
------------

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

Building and Testing:
--------------------

Run `npm install` to install the required modules.

- `grunt` to build the files in the `dist_chrome` directory
- `grunt test` To run the tests in the terminal
- `grunt server` To start the test server at `localhost:9292`
- `grunt watch` To watch the files and re-build when anything changes (useful during development).


[s3-builds]: http://ember-extension.s3-website-us-east-1.amazonaws.com/
[latest-build]: http://ember-extension.s3-website-us-east-1.amazonaws.com/ember-extension-latest.zip
