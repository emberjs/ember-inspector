/*global chrome*/

var panelWindow;

var panel = chrome.devtools.panels.create("Ember", "images/hamster.png", "panes/object-inspector.html", function(panel) {
  panel.onShown.addListener(function(win) {
    panelWindow = win;
    win.activate();
  });
});

var port = chrome.extension.connect();
port.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

port.onMessage.addListener(function(message) {
  panelWindow.updateObject(message);
});
