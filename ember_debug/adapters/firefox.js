import BasicAdapter from "adapters/basic";

var FirefoxAdapter = BasicAdapter.extend({
  init: function() {
    this._super();
    this._connect();
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
