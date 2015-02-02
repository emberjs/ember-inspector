/* globals chrome */
import BasicAdapter from "./basic";

var emberDebug = null;

export default  BasicAdapter.extend({
  name: 'chrome',

  sendMessage: function(options) {
    options = options || {};
    this.get('_chromePort').postMessage(options);
  },

  _chromePort: function() {
    return chrome.extension.connect();
  }.property(),

  _connect: function() {
    var self = this;
    var chromePort = this.get('_chromePort');
    chromePort.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

    chromePort.onMessage.addListener(function(message) {
      if (typeof message.type === 'string' && message.type === 'iframes') {
        sendIframes(message.urls);
      }
      self._messageReceived(message);
    });
  }.on('init'),

  _handleReload: function() {
    var self = this;
    chrome.devtools.network.onNavigated.addListener(function() {
      self._injectDebugger();
      location.reload(true);
    });
  }.on('init'),

  _injectDebugger: function() {
    chrome.devtools.inspectedWindow.eval(loadEmberDebug());
    chrome.devtools.inspectedWindow.onResourceAdded.addListener(function(opts) {
      if (opts.type === 'document') {
        sendIframes([opts.url]);
      }
    });
  }.on('init'),

  willReload: function() {
    this._injectDebugger();
  },

  /**
    We handle the reload here so we can inject
    scripts as soon as possible into the new page.
  */
  reloadTab: function() {
    chrome.devtools.inspectedWindow.reload({
      injectedScript: loadEmberDebug()
    });
  },

  canOpenResource: true,

  openResource: function(file, line) {
    /*global chrome */
    // For some reason it opens the line after the one specified
    chrome.devtools.panels.openResource(file, line - 1);
  }

});

function sendIframes(urls) {
  urls.forEach(function(url) {
    chrome.devtools.inspectedWindow.eval(loadEmberDebug(), { frameURL: url });
  });
}

function loadEmberDebug() {
  var xhr;
  if (!emberDebug) {
    xhr = new XMLHttpRequest();
    xhr.open("GET", chrome.extension.getURL('/panes/ember_debug.js'), false);
    xhr.send();
    emberDebug = xhr.responseText;
  }
  return emberDebug;
}
