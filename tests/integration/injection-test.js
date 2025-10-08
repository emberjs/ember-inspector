import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import Service from '@ember/service';

class ChromePort {
  constructor(self, other) {
    this.onDisconnectListeners = [];
    const port = this;
    this.selfSide = {
      postMessage(msg) {
        other.subscribers.forEach((sub) => sub(msg, other.sender));
      },
      onMessage: {
        addListener(callback) {
          self.subscribers.push(callback);
        },
      },
      onDisconnect: {
        addListener(l) {
          port.onDisconnectListeners.push(l);
        },
      },
    };
    this.otherSide = {
      postMessage(msg) {
        self.subscribers.forEach((sub) => sub(msg, self.sender));
      },
      onMessage: {
        addListener(callback) {
          other.subscribers.push(callback);
        },
      },
      onDisconnect: {
        addListener(l) {
          port.onDisconnectListeners.push(l);
        },
      },
    };
  }
}

// mock chrome api
class ChromeApi {
  /**
   *
   * @param type {'content'|'background'|'inspector'}
   */
  constructor(type) {
    const self = this;
    let subscribers;
    this.subscribers = subscribers = [];
    this.contentScript = null;
    this.inspector = null;
    this.backgroundScript = null;
    this.type = type;

    this.onRemovedListeners = [];
    this.onNavigatedListeners = [];
    this.onConnectListeners = [];
    this.onTabActivatedListeners = [];

    this.registeredContextMenus = {};

    this.storage = {
      sync: {
        get() {},
      },
    };

    const contextMenuListeners = [];

    this.contextMenus = {
      remove(name) {
        delete self.registeredContextMenus[name];
      },

      create(menu) {
        self.registeredContextMenus[menu.id] = menu;
        self.registeredContextMenus[menu.id].onclick = () =>
          contextMenuListeners.forEach((fn) => fn({ menuItemId: menu.id }));
      },

      onClicked: {
        addListener(fn) {
          contextMenuListeners.push(fn);
        },
      },
    };

    this.tabs = {
      onActivated: {
        addListener(l) {
          self.onTabActivatedListeners.push(l);
        },
      },
      onRemoved: {
        addListener(l) {
          self.onRemovedListeners.push(l);
        },
      },
      sendMessage(tabId, msg) {
        self.contentScript.subscribers.forEach((sub) => sub(msg, self.sender));
      },
    };
    this.devtools = {
      panels: {},
      network: {
        onNavigated: {
          addListener(l) {
            self.onNavigatedListeners.push(l);
          },
        },
      },
      inspectedWindow: {
        tabId: 1,
      },
    };
    this.runtime = {
      onConnect: {
        addListener(l) {
          self.onConnectListeners.push(l);
        },
      },
      sendMessage(msg) {
        (self.backgroundScript || self.inspector).subscribers.forEach((sub) =>
          sub(msg, self.sender),
        );
      },
      onMessage: {
        addListener(callback) {
          subscribers.push(callback);
        },
      },
      getURL(url) {
        if (url.startsWith('/')) {
          url = url.slice(1);
        }
        return '/testing/' + url;
      },
      connect() {
        const other = self.connectToOther;
        const port = new ChromePort(self, other);
        other.onConnectListeners.forEach((l) => l(port.otherSide));
        return port.selfSide;
      },
    };
  }

  get connectToOther() {
    return this.contentScript || this.inspector || this.backgroundScript;
  }

  get sender() {
    if (this.type === 'content') {
      return {
        tab: {
          id: 1,
        },
      };
    }
    return {};
  }
}

module('Integration | Injection', function (hooks) {
  setupApplicationTest(hooks);

  /**
   * @type {ChromeApi}
   */
  let contentChromeApi, inspectorChromeApi, backgroundChromeApi;
  const olddefine = window.define;
  const olddrequireModule = window.requireModule;
  const oldEmber = window.Ember;

  let injected;
  let EmberService = Service;

  async function inject(owner, assert) {
    if (injected) return;

    const backgroundScript = await (await fetch('/background.js')).text();
    {
      const chrome = backgroundChromeApi;
      eval(backgroundScript);
      assert.strictEqual(chrome.onRemovedListeners.length, 1);
    }

    let contentScript = await (await fetch('/content-script.js')).text();

    window.addEventListener('message', () => {
      windowMessages += 1;
    });

    let windowMessages = 0;

    {
      // eslint-disable-next-line no-unused-vars
      const chrome = contentChromeApi;
      backgroundChromeApi.onTabActivatedListeners.forEach((act) =>
        act({ tabId: 1 }),
      );
      eval(contentScript);
    }

    assert.strictEqual(
      windowMessages,
      0,
      'content script should not send window messages',
    );

    window.chrome = inspectorChromeApi;

    owner.register('service:port', class extends EmberService {});
    owner.lookup('service:adapters/web-extension');
    window.requireModule = null;
    Object.defineProperty(window, 'Ember', {
      value: null,
      writable: true,
    });

    const emberDebugStarted = new Promise((resolve) => {
      inspectorChromeApi.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'general:applicationBooted') {
          resolve();
        }
      });
    });

    const p = new Promise((resolve) => {
      window.addEventListener('message', (msg) => {
        if (msg.data === 'debugger-client') {
          resolve();
        }
      });
    });

    // check that we do not have any errors
    await new Promise((resolve, reject) => {
      window.addEventListener('error', reject);
      // eslint-disable-next-line no-undef
      chrome.runtime.onMessage.addListener((message) => {
        if (message?.type === 'inject-ember-debug') {
          setTimeout(resolve, 200);
        }
      });
    });

    window.requireModule = olddrequireModule;
    window.Ember = oldEmber;
    window.dispatchEvent(new Event('Ember'));

    await p;
    await emberDebugStarted;
    injected = true;
  }

  hooks.before(() => {
    window.NO_EMBER_DEBUG = false;
    contentChromeApi = new ChromeApi('content');
    inspectorChromeApi = new ChromeApi('inspector');
    backgroundChromeApi = new ChromeApi('background');
    backgroundChromeApi.contentScript = contentChromeApi;
    backgroundChromeApi.inspector = inspectorChromeApi;

    contentChromeApi.backgroundScript = backgroundChromeApi;
    inspectorChromeApi.backgroundScript = backgroundChromeApi;
  });

  hooks.after(() => {
    window.define = olddefine;
    window.requireModule = olddrequireModule;
    window.NO_EMBER_DEBUG = true;
  });

  test('inject ember debug via content and background scripts', async function (assert) {
    await inject(this.owner, assert);
    const emberDebug = globalThis.EmberInspector;

    assert.notStrictEqual(
      emberDebug,
      undefined,
      'ember debug should be loaded',
    );
  });

  test('add Inspect Ember Component Context Menu Item', async function (assert) {
    await inject(this.owner, assert);
    assert.true(
      !!backgroundChromeApi.registeredContextMenus['inspect-ember-component'],
      'should have registered context menu',
    );
  });

  test('triggering Ember Component Context Menu Item should call inspect nearest', async function (assert) {
    await inject(this.owner, assert);
    assert.timeout(100);

    const emberDebug = globalThis.EmberInspector;
    const viewInspection = emberDebug.viewDebug.viewInspection;

    const inspectNearestCalled = new Promise((resolve) => {
      viewInspection.inspectNearest = () => {
        resolve();
      };
    });

    backgroundChromeApi.registeredContextMenus[
      'inspect-ember-component'
    ].onclick();

    await inspectNearestCalled;
    assert.true(true);
  });
});
