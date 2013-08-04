var chromePort;


/**
  Possible messages:

  calculate:
   objectId: objectId,
   property: property.name,
   mixinIndex: mixinIndex

  digDeeper:
    objectId: objectId,
    property: property.name

  releaseObject:
    objectId: objectId

  showLayer:
    objectId: objectId

  hideLayer:
    objectId: objectId

  getTree:
*/

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

export defaultPort;
