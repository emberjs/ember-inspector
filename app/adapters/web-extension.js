/* globals chrome */
import { computed } from '@ember/object';

import BasicAdapter from './basic';
import config from 'ember-inspector/config/environment';

let emberDebug = null;

export default BasicAdapter.extend({
  /**
   * Called when the adapter is created.
   *
   * @method init
   */
  init() {
    this._connect();
    this._handleReload();
    this._injectDebugger();
    this._setThemeColors();

    return this._super(...arguments);
  },

  name: 'web-extension',

  sendMessage(options) {
    options = options || {};
    this.get('_chromePort').postMessage(options);
  },

  _chromePort: computed(function() {
    return chrome.runtime.connect();
  }),

  _connect() {
    let chromePort = this.get('_chromePort');
    chromePort.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

    chromePort.onMessage.addListener((message, sender) => {
      if (typeof message.type === 'string' && message.type === 'iframes') {
        this.sendIframes(message.urls);
      }
      this._messageReceived(message);
    });
  },

  _handleReload() {
    let self = this;
    chrome.devtools.network.onNavigated.addListener(function() {
      self._injectDebugger();
      location.reload(true);
    });
  },

  _injectDebugger() {
    loadEmberDebug().then((emberDebug) => {
      chrome.devtools.inspectedWindow.eval(emberDebug);
      this.onResourceAdded();
    });
  },

  _setThemeColors() {
    // Remove old theme colors to ensure switching themes works
    document.body.classList.remove('theme--light', 'theme--dark');

    let theme = 'theme--light';
    if (chrome.devtools.panels.themeName === 'dark') {
      theme = 'theme--dark';
    }
    document.body.classList.add(theme);
  },

  onResourceAdded(/*callback*/) { },

  willReload() {
    this._injectDebugger();
  },

  /**
   * Open the devtools "Elements" tab and select a specific DOM element.
   *
   * @method inspectDOMElement
   * @param  {String} selector jQuery selector
   */
  inspectDOMElement(selector) {
    chrome.devtools.inspectedWindow.eval(`inspect($('${selector}')[0])`);
  },

  /**
   * Redirect to the correct inspector version.
   *
   * @method onVersionMismatch
   * @param {String} goToVersion
   */
  onVersionMismatch(goToVersion) {
    window.location.href = `../panes-${goToVersion.replace(/\./g, '-')}/index.html`;
  },

  /**
   We handle the reload here so we can inject
   scripts as soon as possible into the new page.
   */
  reloadTab() {
    loadEmberDebug().then((emberDebug) => {
      chrome.devtools.inspectedWindow.reload({ injectedScript: emberDebug });
    });

  },

  canOpenResource: false,

  sendIframes(urls) {
    loadEmberDebug().then((emberDebug) => {
      const { tabId } = chrome.devtools.inspectedWindow;
      chrome.webNavigation.getAllFrames({ tabId }, (frames) => {
        frames.forEach((frame) => {
          if (frame.frameId !== 0) {
            chrome.tabs.executeScript(tabId, {
              code: emberDebug,
              frameId: frame.frameId,
              matchAboutBlank: true,
              runAt: 'document_end'
            });
          }
        });
      });

      urls.forEach(url => {
        chrome.devtools.inspectedWindow.eval(emberDebug, { frameURL: url });
      });
    });
  }
});

function loadEmberDebug() {
  let minimumVersion = config.emberVersionsSupported[0].replace(/\./g, '-');
  let xhr;
  return new Promise((resolve) => {
    if (!emberDebug) {
      xhr = new XMLHttpRequest();
      xhr.open('GET', chrome.runtime.getURL(`/panes-${minimumVersion}/ember_debug.js`));
      xhr.onload = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            emberDebug = xhr.responseText;
            resolve(emberDebug);
          }
        }
      };

      xhr.send();
    } else {
      resolve(emberDebug);
    }
  });
}
