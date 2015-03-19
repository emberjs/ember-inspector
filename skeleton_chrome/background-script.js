/*global chrome*/
(function() {
  "use strict";

  var activeTabs = {},
      ports = {},
      externalExtensions = [];

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

  function registerExtension(ext) {
    externalExtensions.push(ext);
  }

  function messageListener(request, sender) {
    if (!sender.tab) {
      // noop
    } else if (request && request.type === 'emberVersion') {
      activeTabs[sender.tab.id] = request.versions;
      updateTabAction(sender.tab.id);
    } else if (request && request.type === 'resetEmberIcon') {
      hideAction(sender.tab.id);
    } else if (request && request.type === 'registerExtension') {
      registerExtension(request.extension);
    } else {
      var port = ports[sender.tab.id];
      if (port) { port.postMessage(request); }
    }
  }

  chrome.extension.onMessageExternal.addListener(messageListener);
  chrome.extension.onMessage.addListener(messageListener);

  function onConnect(port) {
    var appId;

    port.onMessage.addListener(function(message) {
      if (message.appId) {
        appId = message.appId;

        ports[appId] = port;

        port.onDisconnect.addListener(function() {
          delete ports[appId];
        });
      } else if (message.from === 'devtools') {
        if(!externalExtensions.length) {
          chrome.tabs.sendMessage(appId, message);
        } else {
          externalExtensions.forEach(function(ext) {
            chrome.extension.sendMessage(ext.id, message);
          });
        }
      }
    });
  }

  chrome.extension.onConnectExternal.addListener(onConnect);
  chrome.extension.onConnect.addListener(onConnect);

  chrome.tabs.onUpdated.addListener(function(tabId){
    // Re-render the Tomster when a tab changes.
    if (activeTabs[tabId]) {
      updateTabAction(tabId);
    }

  });

}());
