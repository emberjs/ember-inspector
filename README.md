Ember Extension [![Build Status](https://secure.travis-ci.org/tildeio/ember-extension.png?branch=master)](http://travis-ci.org/tildeio/ember-extension)
===============

Adds an Ember tab to chrome dev tools that allows you to inspect
Ember objects in your application.

Installation
------------

Download a zip file from the [S3 builds page][s3-builds]. The latest version is
located [here][latest-build].

And follow the steps below after "Clone the repository".

Or you can build yourself....

- Clone the repository
- Visit chrome://extensions in chrome
- Make sure `Developer mode` is checked
- Click on 'Load unpacked extension...'
- Choose the `extension_dist` folder in the cloned repo
- Close and re-open developer tools if it's already open

Building and Testing:
--------------------

Run `npm install` to install the required modules.

- `grunt` to build the files in the `extension_dist` directory
- `grunt test` To run the tests in the terminal
- `grunt server` To start the test server at `localhost:9292`
- `grunt watch` To watch the files and re-build when anything changes (useful during development).


[s3-builds]: http://ember-extension.s3-website-us-east-1.amazonaws.com/
[latest-build]: http://ember-extension.s3-website-us-east-1.amazonaws.com/ember-extension-latest.zip

