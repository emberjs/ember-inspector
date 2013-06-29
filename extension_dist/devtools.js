/*global chrome*/

var panelWindow, injectedPanel = false, injectedPage = false, panelVisible = false, savedStack = [];

chrome.devtools.panels.create("Ember", "images/ember-icon-final.png", "panes/index.html");
