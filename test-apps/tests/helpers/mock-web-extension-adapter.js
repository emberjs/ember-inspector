/**
 * Mock implementation of the WebExtension adapter for testing.
 * This mock does not extend Service and provides a minimal implementation
 * for testing purposes.
 *
 * Usage:
 *   import { getMockWebExtensionAdapter } from './helpers/mock-web-extension-adapter';
 *   const adapter = getMockWebExtensionAdapter();
 */
import { tracked } from '@glimmer/tracking';

import BasicAdapter from './mock-basic-adapter';

let emberDebug = null;
let config = {
  emberVersionsSupported: ['3.16.0'],
};

export class MockWebExtensionAdapter extends BasicAdapter {
  @tracked canOpenResource = false;
  name = 'web-extension';

  /**
   * Called when the adapter is created.
   */
  constructor(...args) {
    super(...args);

    this._connect();
    this._handleReload();
    this._setThemeColors();

    void Promise.resolve().then(() => this._sendEmberDebug());
  }

  sendMessage(message) {
    this._chromePort.postMessage(message ?? {});
  }

  _sendEmberDebug() {
    const minimumVersion = config.emberVersionsSupported[0].replace(/\./g, '-');
    const url = chrome.runtime.getURL(
      `/panes-${minimumVersion}/ember_debug.js`,
    );
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
          frameId: sender.frameId,
          from: 'devtools',
          tabId: chrome.devtools.inspectedWindow.tabId,
          type: 'inject-ember-debug',
          value: url,
        });
      }
    });
  }

  get _chromePort() {
    return chrome.runtime.connect();
  }

  _connect() {
    const chromePort = this._chromePort;
    chromePort.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

    chromePort.onMessage.addListener((...args) => {
      this._messageReceived(...args);
    });

    chromePort.onDisconnect.addListener(() => {
      this._connect();
    });
  }

  _handleReload() {
    chrome.devtools.network.onNavigated.addListener(() => {
      this._injectDebugger();
      location.reload();
    });
  }

  _injectDebugger() {
    void loadEmberDebug().then((emberDebug) => {
      chrome.devtools.inspectedWindow.eval(emberDebug, (success, error) => {
        if (success === undefined && error) {
          throw error;
        }
      });
    });
  }

  _setThemeColors() {
    // Remove old theme colors to ensure switching themes works
    document.body.classList.remove('theme-light', 'theme-dark');

    let theme = 'theme-light';
    if (chrome.devtools.panels.themeName === 'dark') {
      theme = 'theme-dark';
    }
    document.body.classList.add(theme);
  }

  willReload() {
    this._injectDebugger();
  }

  /**
   * Open the devtools "Elements" or "Sources" tab and select a specific DOM node or function.
   */
  inspectJSValue(name) {
    chrome.devtools.inspectedWindow.eval(`
      inspect(window[${JSON.stringify(name)}]);
      delete window[${JSON.stringify(name)}];
    `);
  }

  /**
   * Redirect to the correct inspector version.
   */
  onVersionMismatch(goToVersion) {
    window.location.href = `../panes-${goToVersion.replace(
      /\./g,
      '-',
    )}/index.html`;
  }

  /**
   We handle the reload here so we can inject
   scripts as soon as possible into the new page.
   */
  reloadTab() {
    void loadEmberDebug().then((emberDebug) => {
      chrome.devtools.inspectedWindow.reload({
        injectedScript: emberDebug,
      });
    });
  }
}

function loadEmberDebug() {
  const minimumVersion = config.emberVersionsSupported[0].replace(/\./g, '-');
  let xhr;

  return new Promise((resolve) => {
    if (!emberDebug) {
      xhr = new XMLHttpRequest();
      xhr.open(
        'GET',
        chrome.runtime.getURL(`/panes-${minimumVersion}/ember_debug.js`),
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

// Singleton instance
let instance = null;

/**
 * Get or create the singleton instance of MockWebExtensionAdapter
 * @returns {MockWebExtensionAdapter}
 */
export function getMockWebExtensionAdapter() {
  if (!instance) {
    instance = new MockWebExtensionAdapter();
  }
  return instance;
}

/**
 * Reset the singleton instance (useful for test cleanup)
 */
export function resetMockWebExtensionAdapter() {
  instance = null;
}

/**
 * Factory function for registering with Ember's owner
 * Usage: owner.register('service:adapters/web-extension', createMockWebExtensionAdapter);
 */
export function createMockWebExtensionAdapter() {
  return getMockWebExtensionAdapter();
}

export default MockWebExtensionAdapter;
