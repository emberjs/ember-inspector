/*global chrome*/

chrome.extension.onMessage.addListener(function(request, sender) {
  var port = ports[sender.tab.id];

  if (port) {
    port.postMessage(request);
  }
});

var ports = {};

chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(message) {
    var appId = message.appId;

    ports[appId] = port;

    port.onDisconnect.addListener(function() {
      delete ports[appId];
    });
  });
});
