var chromePort;

var Port = Ember.Object.extend(Ember.Evented, {
  init: function() {
    connect.apply(this);
  },
  send: function(messageType, options) {
    options = options || {};
    options.from = 'devtools';
    options.type = messageType;
    chromePort.postMessage(options);
  }
});


var connect = function() {
  var self = this;
  chromePort = chrome.extension.connect();
  chromePort.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

  chromePort.onMessage.addListener(function(message) {
    self.trigger(message.type, message);
  });
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

if (typeof chrome !== 'undefined' && chrome.devtools) {
  chrome.devtools.network.onNavigated.addListener(function() {
    location.reload(true);
  });

  injectDebugger();
}

function injectDebugger() {

  var xhr = new XMLHttpRequest();
  xhr.open("GET", chrome.extension.getURL('/ember_debug/ember_debug.js'), false);
  xhr.send();
  var emberDebug = '(function() { ' + xhr.responseText + ' }());';

  chrome.devtools.inspectedWindow.eval(emberDebug);
}

export default Port;
