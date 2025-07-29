/* global chrome*/

/**
 * Content script injected into the app page by chrome, works in tandem with
 * background.js to coordinate messaging between EmberDebug, EmberInspector and the
 * ClientApp.  The content-script serves as a proxy between EmberDebug
 * and background.js.
 *
 * Content scripts are loaded into every page, and have access to the DOM.  This uses that
 * to inject the in-page-script to determine the ClientApp version onLoad.
 */
(function () {
  'use strict';

  /**
   * Add an event listener for window.messages.
   * The initial message from EmberDebug is used to setup the event listener
   * that proxies between the content-script and EmberDebug using a MessagingChannel.
   *
   * All events from the window are filtered by checking that data and data.type
   * properties exist before sending messages on to the background script.
   *
   * See:
   *     https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API
   */
  window.addEventListener('message', function (event) {
    // received initial message from EmberDebug
    if (event.data === 'debugger-client') {
      var emberDebugPort = event.ports[0];
      listenToEmberDebugPort(emberDebugPort);
    } else if (event.data && event.data.type) {
      chrome.runtime.sendMessage(event.data);
    }
  });

  /**
   * Listen for messages from EmberDebug.
   * @param {Object} emberDebugPort
   */
  function listenToEmberDebugPort(emberDebugPort) {
    // listen for messages from EmberDebug, and pass them on to the background script
    emberDebugPort.addEventListener('message', function (event) {
      chrome.runtime.sendMessage(event.data);
    });

    // listen for messages from the EmberInspector, and pass them on to EmberDebug
    chrome.runtime.onMessage.addListener(function (message) {
      if (message.from === 'devtools') {
        // forward message to EmberDebug
        emberDebugPort.postMessage(message);
      }
    });

    emberDebugPort.start();
  }

  // document.documentElement.dataset is not present for SVG elements
  // this guard prevents that condition from triggering an error
  if (document.documentElement && document.documentElement.dataset) {
    // let EmberDebug know that content script has executed
    document.documentElement.dataset.emberExtension = 1;
  }

  // Iframes should not reset the icon so we make sure
  // it's the top level window before resetting.
  if (window.top === window) {
    // Clear a possible previous Ember icon
    chrome.runtime.sendMessage({ type: 'resetEmberIcon' });
  }

  /**
   * Inject JS into the page to check for an app on domready.  The in-page-script
   * is used by all variants of ember-inspector (Chrome, FF, Bookmarklet) to get
   * the libraries running in the ClientApp
   */
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = chrome.runtime.getURL('scripts/in-page-script.js');
  if (document.head && document.contentType !== 'application/pdf') {
    document.head.appendChild(script);
    script.onload = function () {
      document.head.removeChild(script);
    };
  }

  let injected = false;

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'inject-ember-debug') {
      if (!injected) {
        // cannot use eval here, as the context is limited to the content script-
        const elem = document.createElement('script');
        elem.type = 'module';
        elem.src = message.value;
        document.head.appendChild(elem);
        injected = true;
      }
    }
  });
  chrome.runtime.sendMessage('ember-content-script-ready');
})();
