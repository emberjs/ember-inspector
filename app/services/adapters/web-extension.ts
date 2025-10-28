import { tracked } from '@glimmer/tracking';

import BasicAdapter from './basic';
import config from 'ember-inspector/config/environment';
import type { Message } from '../port';

let emberDebug: string | null = null;

export default class WebExtension extends BasicAdapter {
  @tracked canOpenResource = false;
  name = 'web-extension';

  /**
   * Called when the adapter is created.
   */
  constructor(...args: unknown[]) {
    // @ts-expect-error ignore
    super(...args);

    this._connect();
    this._handleReload();
    this._setThemeColors();

    void Promise.resolve().then(() => this._sendEmberDebug());
  }

  sendMessage(message?: Partial<Message>) {
    if (message) {
      message.tabId = chrome.devtools.inspectedWindow.tabId;
    }
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
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
      chrome.devtools.inspectedWindow.eval(
        emberDebug as string,
        (success, error) => {
          if (success === undefined && error) {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw error;
          }
        },
      );
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
  inspectJSValue(name: string) {
    chrome.devtools.inspectedWindow.eval(`
      inspect(window[${JSON.stringify(name)}]);
      delete window[${JSON.stringify(name)}];
    `);
  }

  /**
   * Redirect to the correct inspector version.
   */
  onVersionMismatch(goToVersion: string) {
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
        injectedScript: emberDebug as string,
      });
    });
  }
}

function loadEmberDebug() {
  const minimumVersion = config.emberVersionsSupported[0].replace(/\./g, '-');

  return new Promise((resolve) => {
    const url = chrome.runtime.getURL(
      `/panes-${minimumVersion}/ember_debug.js`,
    );
    resolve(`import('${url}')`);
  });
}
