/*global chrome*/

// @ts-check

/**
 * Run when devtools.html is automatically added to the Chrome devtools panels.
 * It creates a new pane using the panes/index.html which includes EmberInspector.
 */
chrome.devtools.panels.create("{{TAB_LABEL}}", "{{PANE_ROOT}}/assets/svg/ember-icon.svg", "./bootloader.html", panel => {

  class BackgroundPage {
    static connect() {
      let conn = chrome.runtime.connect({ name: "ember-inspector" });
      let page = new BackgroundPage(conn);

      conn.onMessage.addListener(message => page.onMessage(message));
      chrome.devtools.network.onNavigated.addListener(url => page.navigated(url));
      panel.onShown.addListener(extWindow => page.onShown(extWindow));
      panel.onHidden.addListener(() => page.onHidden());
      page.start();
    }

    /**
     *
     * @param {chrome.runtime.Port} conn
     */
    constructor(conn) {
      this.conn = conn;
      this.validMessages = ['hostEval', 'bootEmberInspector'];
      this.bootloader = new Bootloader();
    }

    start() {
      this.conn.postMessage({
        name: 'init',
        from: 'devtools:bootstrap',
        tabId: chrome.devtools.inspectedWindow.tabId
      })
    }

    /**
     * @param { { type: 'hostEval', value: string } } message
     */
    onMessage(message) {
      if (!message || !message.type) {
        console.warn(`Invalid message`, message);
        return;
      }

      console.debug(`bootstrap received message (${message.type})`, message);

      if (this.validMessages.includes(message.type)) {
        this[message.type](message);
      }
    }

    /**
     *
     * @param {Window} extWindow
     */
    onShown(extWindow) {
      if (this.bootloader instanceof WindowBootloader) {
        console.log(`onShown run after initial onShown`);
        return;
      }

      this.bootloader = new WindowBootloader(extWindow);

      // TODO: handle cancellation
      this.bootloader.bootstrap();
    }

    onHidden() {
      this.bootloader.destroy();
    }

    /**
     *
     * @param { { type: 'bootEmberInspector', value: string } } message
     */
    bootEmberInspector(message) {

    }

    /**
     *
     * @param { { type: 'hostEval', value: string } } message
     */
    hostEval(message) {
      chrome.devtools.inspectedWindow.eval(message.value);
    }

    /**
     * @param {string} url
     */
    navigated(url) {
      console.log('navigating', chrome.devtools.inspectedWindow.tabId);
      this.conn.postMessage({
        name: 'navigation',
        tabId: chrome.devtools.inspectedWindow.tabId,
        url
      })

    }
  }

  class Bootloader {
    bootstrap() {
      // do nothing
    }

    destroy() {
      // do nothing
    }
  }

  class WindowBootloader {
    /**
     *
     * @param {Window} extWindow
     */
    constructor(extWindow) {
      this.extWindow = extWindow;
    }

    async bootstrap() {
      let version = await detectHostEmberVersion();
      console.log(`detected version`, version);
      let pane = paneFor(version);
      console.log(`chose pane`, pane);
      this.extWindow.location.replace(`${pane}/index.html`);
    }

    destroy() {
      // this happens when the current page changes its global
    }
  }

  // Question: connect on devtools show?
  BackgroundPage.connect();
});

/**
 * @returns Promise<string>
 */
function detectHostEmberVersion() {
  return new Promise((resolve, reject) => {
    function tryIt() {
      let script = `
        (() => {
          try {
            if (typeof Ember.VERSION === 'string') {
              return { version: Ember.VERSION };
            }
          } catch {
            // noop
          }

          return { errored: true };
        })();
      `;

      chrome.devtools.inspectedWindow.eval(script, {}, (result, error) => {
        if (error !== undefined || result.errored === true) {
          setTimeout(tryIt, 500);
        } else {
          resolve(result.version);
        }
      });
    }

    tryIt();
  })
}

// (async function main() {
//   function detectEmberVersion() {
//     return new Promise((resolve, reject) => {
//       function tryIt() {
//         let script = `
//           (() => {
//             try {
//               if (typeof Ember.VERSION === 'string') {
//                 return { version: Ember.VERSION };
//               }
//             } catch {
//               // noop
//             }

//             return { errored: true };
//           })();
//         `;

//         chrome.devtools.inspectedWindow.eval(script, undefined, (result, error) => {
//           if (error !== undefined || result.errored === true) {
//             setTimeout(tryIt, 500);
//           } else {
//             resolve(result.version);
//           }
//         });
//       }

//       tryIt();
//     })
//   }

//   let version = await detectEmberVersion();
//   let pane = paneFor(version);

//   // let iframe = document.createElement('iframe');
//   // iframe.src = `${pane}/index.html`;
//   // document.body.appendChild(iframe);
//   location.href = `${pane}/index.html`;
// })();



// Shared code...

/**
 *
 * @param {string} emberVersion
 */
function paneFor(emberVersion) {
  let PANES = [
    '3.4.0',
    '2.7.0',
    '0.0.0'
  ];

  /**
   *
   * @param {string} version
   */
  function parseVersion(version) {
    return version
      .replace(/-.+$/g, '')
      .split('.')
      .map(part => parseInt(part, 10));
  }

  /**
   *
   * @param {string} a
   * @param {string} b
   */
  function compareVersion(a, b) {
    let lhs = parseVersion(a);
    let rhs = parseVersion(b);

    let count = Math.max(lhs.length, rhs.length);

    for (let i=0; i<count; i++) {
      let l = lhs[i];
      let r = rhs[i];

      if (l < r) {
        return -1;
      } else if (r < l) {
        return 1;
      }
    }

    return 0;
  }

  for (let pane of PANES) {
    if (compareVersion(emberVersion, pane) >= 0) {
      return `panes-${pane.replace(/\./g, '-')}`;
    }
  }

  throw new Error(`BUG: No version of Ember should be less than 0.0.0.`);
}
