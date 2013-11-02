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
      self._messageReceived(evt.detail);
    }, false);
  }.on('init')
});

export default FirefoxAdapter;
