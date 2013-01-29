/*global chrome*/

var firstTime = true;

var panel = chrome.devtools.panels.create("Ember", "images/hamster.png", "panes/object-inspector.html", function(panel) {
  panel.onShown.addListener(function(panelWindow) {
    if (firstTime) {
      firstTime = false;
      panelWindow.activate();

      var port = chrome.extension.connect();
      port.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

      port.onMessage.addListener(function(message) {
        panelWindow.updateObject(message);
      });
    }
  });
});

