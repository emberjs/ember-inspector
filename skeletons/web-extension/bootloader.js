/*global chrome*/

alert("BOOTLOADER");

/**
 * Run when devtools.html is automatically added to the Chrome devtools panels.
 * It creates a new pane using the panes/index.html which includes EmberInspector.
 */
(async function main() {
  function detectEmberVersion() {
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

        chrome.devtools.inspectedWindow.eval(script, undefined, (result, error) => {
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

  let version = await detectEmberVersion();
  let pane = paneFor(version);

  // let iframe = document.createElement('iframe');
  // iframe.src = `${pane}/index.html`;
  // document.body.appendChild(iframe);
  location.href = `${pane}/index.html`;
})();



// Shared code...

function paneFor(emberVersion) {
  let PANES = [
    '3.4.0',
    '2.7.0',
    '0.0.0'
  ];

  function parseVersion(version) {
    return version
      .replace(/-.+$/g, '')
      .split('.')
      .map(part => parseInt(part, 10));
  }

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
