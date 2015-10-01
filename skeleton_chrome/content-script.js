(function() {

  "use strict";

  window.addEventListener('message', function(event) {
    if (event.data === 'debugger-client') {
      var port = event.ports[0];
      listenToPort(port);
    } else if (event.data && event.data.type) {
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
  if (document) {
    if (document.documentElement) {
      if (!document.documentElement.dataset) {
        document.documentElement.dataset = {};
      }
    } else {
      document.documentElement = {};
      document.documentElement.dataset = {};
    }
  }
  document.documentElement.dataset.emberExtension = 1;

  // Iframes should not reset the icon so we make sure
  // it's the parent window before resetting.
  if (window.top === window) {
    // Clear a possible previous Ember icon
    chrome.extension.sendMessage({ type: 'resetEmberIcon' });
  }


  // inject JS into the page to check for an app on domready
  var script = document.createElement('script');
  script.type = "text/javascript";
  script.src = chrome.extension.getURL("panes/in-page-script.js");
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
