import BasicAdapter from "adapters/basic";

var FirefoxAdapter = BasicAdapter.extend({

  sendMessage: function(options) {
    options = options || {};
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent("ember-extension-send", true, true, options);
    document.documentElement.dispatchEvent(event);
  },

  _connect: function() {
    var self = this;
    window.addEventListener("ember-extension-receive", function(evt) {
      // We clone the object so that Ember prototype extensions
      // are applied.
      self._messageReceived(Ember.$.extend(true, {}, evt.detail));
    }, false);
  }.on('init')
});

export default FirefoxAdapter;
