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
        // FIX: needed to fix permission denied exception on Firefox >= 30
        // - https://github.com/emberjs/ember-inspector/issues/147
        // - https://blog.mozilla.org/addons/2014/04/10/changes-to-unsafewindow-for-the-add-on-sdk/
        switch (typeof message) {
        case "string":
          message = JSON.parse(message);
          break;
        case "object":
          break;
        default:
          throw new Error("ember-debug-receive: string or object expected");
        }
        self._messageReceived(message);
      });
    });
  }

});

export default FirefoxAdapter;
