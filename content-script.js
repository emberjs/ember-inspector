window.addEventListener('message', function(event) {
  if (event.data === 'debugger-client') {
    var port = event.ports[0];
    listenToPort(port);
  }
});

function listenToPort(port) {
  port.addEventListener('message', function(event) {
    chrome.extension.sendMessage(event.data);
  });

  port.start();
}

