'use strict';

const VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: require('./package').name,

  // When running ember-try on Ember < 3.13, colocation support is
  // disabled in ember-cli-htmlbars and causes a build error. When
  // running ember-try, we actually don't care about the "app" side
  // at all – all we do is run the ember_debug tests (via a --filter
  // option to ember test in the ember-try config). The only reason
  // we are even building the app is to get the test harness (qunit
  // and friends) to work. In the long run, we should split up the
  // build and not run the app build in ember-try, but in the mean
  // time, this drops all the addon files (since we don't need them)
  // to avoid the problem. The app will of course not work correctly
  // at runtime, but it was never meant to work on old ember versions
  // in the first place.
  treeForAddon() {
    let checker = new VersionChecker(this.project);
    let emberChecker = checker.forEmber();

    if (emberChecker.gte('3.13.0') ) {
      return this._super.treeForAddon.apply(this, arguments);
    } else {
      return null;
    }
  },

  isDevelopingAddon() {
    return true;
  }
};
