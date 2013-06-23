var chromePort, subscriptions = {}, actions;

var Port = Ember.Object.extend(Ember.Evented, {
  init: function() {
    connect.apply(this);
  },
  send: function(actionName) {
    var args = [].slice.call(arguments, 1);
    actions[actionName].apply(this, args);
  }
});


var connect = function() {
  var self = this;
  chromePort = chrome.extension.connect();
  chromePort.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

  chromePort.onMessage.addListener(function(message) {
    var eventName;
    if (message.type === 'viewTree') {
      eventName = 'viewTree';
    } else if (message.details) {
      eventName = 'updateObject';
    } else if (message.property) {
      eventName = 'updateProperty';
    }

    self.trigger(eventName, message);
  });
};

actions = {
  calculate: function(objectId, property, mixinIndex) {
    chromePort.postMessage({ from: 'devtools', type: 'calculate', objectId: objectId, property: property.name, mixinIndex: mixinIndex });
  },
  digDeeper: function(objectId, property) {
    chromePort.postMessage({ from: 'devtools', type: 'digDeeper', objectId: objectId, property: property.name });
  },
  releaseObject: function(objectId) {
    chromePort.postMessage({ from: 'devtools', type: 'releaseObject', objectId: objectId });
  },
  showLayer: function(objectId) {
    chromePort.postMessage({ from: 'devtools', type: 'showLayer', objectId: objectId });
  },
  hideLayer: function(objectId) {
    chromePort.postMessage({ from: 'devtools', type: 'hideLayer', objectId: objectId });
  },
  getTree: function() {
    chromePort.postMessage({ from: 'devtools', type: 'getTree' });
  }
};


Ember.Application.initializer({
  name: "port",

  initialize: function(container, application) {
    container.register('port', 'main', application.Port);
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

export = Port;
