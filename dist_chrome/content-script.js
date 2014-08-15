(function() {

  "use strict";

  window.addEventListener('message', function(event) {
    if (event.data === 'debugger-client') {
      var port = event.ports[0];
      listenToPort(port);
    } else if (event.data.type) {
      chrome.extension.sendMessage(event.data);
    }
  });

  function listenToPort(port) {
    port.addEventListener('message', function(event) {
      chrome.extension.sendMessage(event.data);
    });

    chrome.extension.onMessage.addListener(function(message) {
      if (message.from === 'devtools') {
        port.postMessage(message);
      }
    });

    port.start();
  }

  // let ember-debug know that content script has executed
  document.documentElement.dataset.emberExtension = 1;


  // clear a possible previous Ember icon
  chrome.extension.sendMessage({ type: 'resetEmberIcon' });

  // inject JS into the page to check for an app on domready
  var script = document.createElement('script');
  script.type = "text/javascript";
  script.src = chrome.extension.getURL("in-page-script.js");
  if (document.body) {
    document.body.appendChild(script);
    script.onload = function() {
      document.body.removeChild(script);
    };
  }

  var iframes = document.getElementsByTagName('iframe');
  var urls = [];
  for (var i = 0, l = iframes.length; i < l; i ++) {
    urls.push(iframes[i].src);
  }

  // FIXME
  setTimeout(function() {
    chrome.extension.sendMessage({type: 'iframes', urls: urls});
  }, 500);


}());
