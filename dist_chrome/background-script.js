/*global chrome*/
(function() {
  "use strict";

  var activeTabs = {},
      ports = {};

  function generateVersionsTooltip(versions) {
    return versions.map(function(lib) {
      return lib.name + " " + lib.version;
    }).join("\n");
  }

  function setActionTitle(tabId){
    chrome.pageAction.setTitle({
      tabId: tabId,
      title: generateVersionsTooltip(activeTabs[tabId])
    });
  }

  function updateTabAction(tabId){
    chrome.storage.sync.get("options", function(data) {
      if (!data.options.showTomster) { return; }
      chrome.pageAction.show(tabId);
      setActionTitle(tabId);
    });
  }

  function hideAction(tabId){
    delete activeTabs[tabId];
    chrome.pageAction.hide(tabId);
  }

  chrome.extension.onMessage.addListener(function(request, sender) {
    if (!sender.tab) {
      // noop
    } else if (request && request.type === 'emberVersion') {
      activeTabs[sender.tab.id] = request.versions;
      updateTabAction(sender.tab.id);
    } else if (request && request.type === 'resetEmberIcon') {
      hideAction(sender.tab.id);
    } else {
      var port = ports[sender.tab.id];
      if (port) { port.postMessage(request); }
    }
  });

  chrome.extension.onConnect.addListener(function(port) {
    var appId;

    port.onMessage.addListener(function(message) {
      if (message.appId) {
        appId = message.appId;

        ports[appId] = port;

        port.onDisconnect.addListener(function() {
          delete ports[appId];
        });
      } else if (message.from === 'devtools') {
        chrome.tabs.sendMessage(appId, message);
      }
    });
  });

  chrome.tabs.onUpdated.addListener(function(tabId){
    // Re-render the Tomster when a tab changes.
    if (activeTabs[tabId]) {
      updateTabAction(tabId);
    }

  });

}());
