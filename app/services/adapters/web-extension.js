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
    this._injectDebugger();
    this._setThemeColors();

    return super.init(...arguments);
  }

  sendMessage(options) {
    options = options || {};
    this._chromePort.postMessage(options);
  }

  @computed
  get _chromePort() {
    return chrome.runtime.connect();
  }

  _connect() {
    let chromePort = this._chromePort;
    chromePort.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

    chromePort.onMessage.addListener((message) => {
      if (typeof message.type === 'string' && message.type === 'iframes') {
        this.sendIframes(message.urls);
      }
      this._messageReceived(message);
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
      this.onResourceAdded();
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

  onResourceAdded /*callback*/() {}

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

  sendIframes(urls) {
    loadEmberDebug().then((emberDebug) => {
      urls.forEach((url) => {
        chrome.devtools.inspectedWindow.eval(emberDebug, { frameURL: url });
      });
    });
  }
}

function loadEmberDebug() {
  let minimumVersion = config.emberVersionsSupported[0].replace(/\./g, '-');
  let xhr;

  function loadEmberDebugInWebpage() {
    const waitForEmberLoad = new Promise((resolve) => {
      if (window.requireModule && window.requireModule.has('ember')) {
        return resolve();
      }

      /**
       * NOTE: if the above (for some reason) fails and the consuming app has
       *       deprecation-workflow's throwOnUnhandled: true
       *         or set `ember-global`'s handler to 'throw'
       *       and is using at least `ember-source@3.27`
       *
       *       this will throw an exception in the consuming project
       */
      if (window.Ember) return resolve();

      window.addEventListener('Ember', resolve, { once: true });
    });
    waitForEmberLoad.then(() => {
      return "replace-with-ember-debug";
    });
  }
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
            // prepare for usage in replace, dollar signs are part of special replacement patterns...
            emberDebug = emberDebug.replace(/\$/g, '$$$$');
            emberDebug =
              '(' +
              loadEmberDebugInWebpage
                .toString()
                .replace('"replace-with-ember-debug";', emberDebug) +
              ')()';
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
