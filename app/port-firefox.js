//NOTE: connect devtool iframe to browser devtool addon
var chromePort;

var Port = Ember.Object.extend(Ember.Evented, {
  init: function() {
    connect.apply(this);
  },
  send: function(messageType, options) {
    options = options || {};
    options.from = 'devtools';
    options.type = messageType;
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent("ember-inspector-message", true, true, options);
    document.documentElement.dispatchEvent(event);
    console.debug("ember inspector port send", options);
  }
});


var connect = function() {
  var self = this;
  console.debug("EMBER INSPECTOR APP connect");

  window.addEventListener("message", function(evt) {
    var message = evt.data;
    console.debug("ember inspector port receive", message);

    self.trigger(message.type, message);
  }, false);
};


Ember.Application.initializer({
  name: "port",

  initialize: function(container, application) {
    container.register('port:main', application.Port);
    container.lookup('port:main');
  }
});

Ember.Application.initializer({
  name: "injectPort",

  initialize: function(container) {
    container.typeInjection('controller', 'port', 'port:main');
    container.typeInjection('route', 'port', 'port:main');
  }
});

var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

if (!is_chrome) {
  // TODO: if the tab inspected navigate, force reload and inject ember_debug
  window.postMessage({ injectDebugger: true }, "*");
}

export default Port;
