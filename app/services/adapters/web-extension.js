/* globals chrome */
import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import BasicAdapter from './basic';
import config from 'ember-inspector/config/environment';

let emberDebug = null;

export default class WebExtension extends BasicAdapter {
  @tracked canOpenResource = false;
  name = 'web-extension';

  /**
   * Called when the adapter is created.
   *
   * @method init
   */
  init() {
    this._connect();
    this._handleReload();
    this._setThemeColors();

    Promise.resolve().then(() => this._sendEmberDebug());

    return super.init(...arguments);
  }

  sendMessage(options) {
    options = options || {};
    this._chromePort.postMessage(options);
  }

  _sendEmberDebug() {
    let minimumVersion = config.emberVersionsSupported[0].replace(/\./g, '-');
    let url = chrome.runtime.getURL(`/panes-${minimumVersion}/ember_debug.js`);
    // first send to all frames in current tab
    this.sendMessage({
      from: 'devtools',
      tabId: chrome.devtools.inspectedWindow.tabId,
      type: 'inject-ember-debug',
      value: url,
    });
    this.onMessageReceived((message, sender) => {
      if (message === 'ember-content-script-ready') {
        this.sendMessage({
          from: 'devtools',
          type: 'inject-ember-debug',
          value: url,
          tabId: chrome.devtools.inspectedWindow.tabId,
          frameId: sender.frameId,
        });
      }
    });
  }

  @computed
  get _chromePort() {
    return chrome.runtime.connect();
  }

  _connect() {
    let chromePort = this._chromePort;
    chromePort.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

    chromePort.onMessage.addListener((...args) => {
      this._messageReceived(...args);
    });
  }

  _handleReload() {
    let self = this;
    chrome.devtools.network.onNavigated.addListener(function () {
      self._injectDebugger();
      location.reload(true);
    });
  }

  _injectDebugger() {
    loadEmberDebug().then((emberDebug) => {
      chrome.devtools.inspectedWindow.eval(emberDebug, (success, error) => {
        if (success === undefined && error) {
          throw error;
        }
      });
    });
  }

  _setThemeColors() {
    // Remove old theme colors to ensure switching themes works
    document.body.classList.remove('theme--light', 'theme--dark');

    let theme = 'theme--light';
    if (chrome.devtools.panels.themeName === 'dark') {
      theme = 'theme--dark';
    }
    document.body.classList.add(theme);
  }

  willReload() {
    this._injectDebugger();
  }

  /**
   * Open the devtools "Elements" tab and select a specific DOM node.
   *
   * @method inspectDOMNode
   * @param {String} name
   */
  inspectDOMNode(name) {
    chrome.devtools.inspectedWindow.eval(`
      inspect(window[${JSON.stringify(name)}]);
      delete window[${JSON.stringify(name)}];
    `);
  }

  /**
   * Redirect to the correct inspector version.
   *
   * @method onVersionMismatch
   * @param {String} goToVersion
   */
  onVersionMismatch(goToVersion) {
    window.location.href = `../panes-${goToVersion.replace(
      /\./g,
      '-'
    )}/index.html`;
  }

  /**
    We handle the reload here so we can inject
    scripts as soon as possible into the new page.
  */
  reloadTab() {
    loadEmberDebug().then((emberDebug) => {
      chrome.devtools.inspectedWindow.reload({ injectedScript: emberDebug });
    });
  }
}

function loadEmberDebug() {
  let minimumVersion = config.emberVersionsSupported[0].replace(/\./g, '-');
  let xhr;

  return new Promise((resolve) => {
    if (!emberDebug) {
      xhr = new XMLHttpRequest();
      xhr.open(
        'GET',
        chrome.runtime.getURL(`/panes-${minimumVersion}/ember_debug.js`)
      );
      xhr.onload = function () {
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
