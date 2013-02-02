/*global chrome*/

console.log("Devtools");
var injectedPanel = false, injectedPage = false, panelVisible = false, savedStack = [];

chrome.devtools.network.onNavigated.addListener(function() {
  injectDebugger();
  savedStack = [];
});

if (!injectedPanel) {
  injectedPanel = true;
  chrome.devtools.panels.create("Ember", "images/hamster.png", "panes/object-inspector.html", function(panel) {
    var panelWindow, queuedSend;

    panel.onHidden.addListener(function() {
      panelVisible = false;
    });

    panel.onShown.addListener(function(win) {
      panelVisible = true;
      if (!panelWindow) {
        panelWindow = win;

        panelWindow.activate();

        panelWindow.calculate = function(property, mixinIndex) {
          port.postMessage({ from: 'devtools', type: 'calculate', objectId: objectId, property: property.name, mixinIndex: mixinIndex });
        };

        panelWindow.digDeeper = function(objectId, property) {
          port.postMessage({ from: 'devtools', type: 'digDeeper', objectId: objectId, property: property.name });
        };

        chrome.devtools.network.onNavigated.addListener(function() {
          panelWindow.resetDebugger();
        });
      }

      if (queuedSend) {
        panelWindow[queuedSend.name].apply(panelWindow, queuedSend.args);
        queuedSend = null;
      }

      savedStack.forEach(function(item) {
        panelWindow.updateObject(item);
      });
    });

    var port = chrome.extension.connect();
    port.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

    var objectId;

    port.onMessage.addListener(function(message) {
      var toSend;

      if (message.details) {
        toSend = { name: 'updateObject', args: [message] };
        objectId = message.objectId;
      } else if (message.property) {
        toSend = { name: 'updateProperty', args: [message] };
      }

      console.log(panelWindow, toSend);
      if (panelWindow && toSend) {
        panelWindow[toSend.name].apply(panelWindow, toSend.args);
      } else {
        queuedSend = toSend;
      }
    });

    injectDebugger();
  });
}

function injectDebugger() {
  var url = chrome.extension.getURL('panes/ember-debug.js');

  var xhr = new XMLHttpRequest();
  xhr.open("GET", chrome.extension.getURL('/panes/ember-debug.js'), false);
  xhr.send();

  setTimeout(function() {
    chrome.devtools.inspectedWindow.eval(xhr.responseText);
  }, 100);
}

