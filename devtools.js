/*global chrome*/

var panelWindow, injectedPanel = false, injectedPage = false, panelVisible = false, savedStack = [];

chrome.devtools.panels.create("Ember", "images/hamster.png", "panes/object-inspector.html");
