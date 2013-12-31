import BasicAdapter from "adapters/basic";

var FirefoxAdapter = BasicAdapter.extend({
  init: function() {
    this._super();
    this._connect();
  },

  debug: function() {
    // WORKAROUND: temporarily workaround issues with firebug console object:
    // - https://github.com/tildeio/ember-extension/issues/94
    // - https://github.com/firebug/firebug/pull/109
    // - https://code.google.com/p/fbug/issues/detail?id=7045
    try {
      this._super.apply(this, arguments);
    } catch(e) { }
  },
  log: function() {
    // WORKAROUND: temporarily workaround issues with firebug console object:
    // - https://github.com/tildeio/ember-extension/issues/94
    // - https://github.com/firebug/firebug/pull/109
    // - https://code.google.com/p/fbug/issues/detail?id=7045
    try {
      this._super.apply(this, arguments);
    } catch(e) { }
  },

  sendMessage: function(options) {
    options = options || {};
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent("ember-debug-send", true, true, options);
    document.documentElement.dispatchEvent(event);
  },

  inspectElement: function(elem) {
    this.sendMessage({
      type: 'view:devtools:inspectDOMElement',
      elementSelector: "#" + elem.getAttribute('id')
    });
  },

  _connect: function() {
    var self = this;

    window.addEventListener('ember-debug-receive', function(event) {
      var message = event.detail;
      Ember.run(function() {
        self._messageReceived(message);
      });
    });
  }

});

export default FirefoxAdapter;
