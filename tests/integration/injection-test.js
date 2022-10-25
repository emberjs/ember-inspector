import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

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

    this.tabs = {
      onActivated: {
        addListener() {},
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
          sub(msg, self.sender)
        );
      },
      onMessage: {
        addListener(callback) {
          subscribers.push(callback);
        },
      },
      getURL(url) {
        return url;
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

let loaderInstance = {};
function getLoader(def, req) {
  let { define, requireModule } = loaderInstance;
  if (typeof define !== 'function' || typeof requireModule !== 'function') {
    (function () {
      let registry = {},
        seen = {};

      define = function (name, deps, callback) {
        if (arguments.length < 3) {
          callback = deps;
          deps = [];
        }
        registry[name] = { deps, callback };
      };

      requireModule = function (name) {
        if (!name.startsWith('ember-debug')) {
          return req(name);
        }
        if (seen[name]) {
          return seen[name];
        }

        let mod = registry[name];
        if (!mod) {
          throw new Error(`Module: '${name}' not found.`);
        }

        seen[name] = {};

        let deps = mod.deps;
        let callback = mod.callback;
        let reified = [];
        let exports;

        for (let i = 0, l = deps.length; i < l; i++) {
          if (deps[i] === 'exports') {
            reified.push((exports = {}));
          } else {
            reified.push(requireModule(deps[i]));
          }
        }

        let value = callback.apply(this, reified);
        seen[name] = exports || value;
        return seen[name];
      };

      requireModule.has = req.has;

      define.registry = registry;
      define.seen = seen;
    })();
  }
  loaderInstance = { define, requireModule };
  return loaderInstance;
}

module('Integration | Injection', function (hooks) {
  setupApplicationTest(hooks);

  let contentChromeApi, inspectorChromeApi, backgroundChromeApi;
  const olddefine = window.define;
  const olddrequireModule = window.requireModule;
  hooks.before(() => {
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
  });

  // eslint-disable-next-line qunit/require-expect
  test('inject ember debug via content and backround scripts', async function (assert) {
    const backgroundScript = await (
      await fetch('/background-script.js')
    ).text();
    {
      // eslint-disable-next-line no-unused-vars
      const chrome = backgroundChromeApi;
      eval(backgroundScript);
      assert.strictEqual(chrome.onRemovedListeners.length, 1);
    }

    let contentScript = await (await fetch('/content-script.js')).text();

    window.addEventListener('message', () => {
      windowMessages += 1;
    });

    let windowMessages = 0;

    // setup global loader for ember-debug, will be reset after test
    // eslint-disable-next-line no-unused-vars
    const { define, requireModule } = getLoader(
      window.define,
      window.requireModule
    );
    window.define = define;
    window.requireModule = requireModule;
    {
      // eslint-disable-next-line no-unused-vars
      const chrome = contentChromeApi;
      eval(contentScript);
    }

    assert.strictEqual(
      windowMessages,
      0,
      'content script should not send window messages'
    );

    window.chrome = inspectorChromeApi;
    const p = new Promise((resolve) => {
      window.addEventListener('message', (msg) => {
        if (msg.data === 'debugger-client') {
          resolve();
        }
      });
    });
    this.owner.lookup('service:adapters/web-extension');
    await p;
    const emberDebug = requireModule('ember-debug/main');
    assert.notStrictEqual(
      emberDebug,
      undefined,
      'ember debug should be loaded'
    );
  });
});
