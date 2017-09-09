/* eslint no-empty:0 */
import WebExtension from "./web-extension";
const Ember = window.Ember;
const { run } = Ember;

export default WebExtension.extend({
  debug() {
    // WORKAROUND: temporarily workaround issues with firebug console object:
    // - https://github.com/tildeio/ember-extension/issues/94
    // - https://github.com/firebug/firebug/pull/109
    // - https://code.google.com/p/fbug/issues/detail?id=7045
    try {
      this._super(...arguments);
    } catch (e) { }
  },
  log() {
    // WORKAROUND: temporarily workaround issues with firebug console object:
    // - https://github.com/tildeio/ember-extension/issues/94
    // - https://github.com/firebug/firebug/pull/109
    // - https://code.google.com/p/fbug/issues/detail?id=7045
    try {
      this._super(...arguments);
    } catch (e) { }
  }
});
