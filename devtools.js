/*global chrome*/

var firstTime = true;

var panel = chrome.devtools.panels.create("Ember", "images/hamster.png", "panes/object-inspector.html", function(panel) {
  panel.onShown.addListener(function(panelWindow) {
    if (firstTime) {
      firstTime = false;
      panelWindow.activate();

      var port = chrome.extension.connect();
      port.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

      var objectId;

      port.onMessage.addListener(function(message) {
        if (message.details) {
          panelWindow.updateObject(message);
          objectId = message.objectId;
        } else if (message.property) {
          panelWindow.updateProperty(message);
        }
      });

      panelWindow.calculate = function(property, mixinIndex) {
        port.postMessage({ objectId: objectId, property: property, mixinIndex: mixinIndex });
      };

      chrome.devtools.network.onNavigated.addListener(function() {
        panelWindow.injectDebugger();
      });
    }
  });
});

