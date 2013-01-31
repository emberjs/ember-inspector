/*global chrome*/

chrome.extension.onMessage.addListener(function(request, sender) {
  var port = ports[sender.tab.id];

  if (port) {
    port.postMessage(request);
  }
});

var ports = {};

chrome.extension.onConnect.addListener(function(port) {
  var appId;

  port.onMessage.addListener(function(message) {
    if (message.appId) {
      appId = message.appId;

      ports[appId] = port;

      port.onDisconnect.addListener(function() {
        delete ports[appId];
      });
    } else if (message.property) {
      chrome.tabs.sendMessage(appId, message);
    }
  });
});
