window.addEventListener('message', function(event) {
  if (event.data === 'debugger-client') {
    var port = event.ports[0];
    listenToPort(port);
  } else if (event.data.property) {
    chrome.extension.sendMessage(event.data);
  }
});

function listenToPort(port) {
  port.addEventListener('message', function(event) {
    chrome.extension.sendMessage(event.data);
  });

  chrome.extension.onMessage.addListener(function(message) {
    port.postMessage(message);
  });

  port.start();
}

