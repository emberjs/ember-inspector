(function () {
  'use strict';

  /**
   * The panes and ember_debug.js sit next to this script,
   * at the site root or in a subfolder.
   */
  const scriptUrl = document.currentScript.src;

  const inject = (fileName) => {
    const script = document.createElement('script');

    script.type = 'module';
    script.src = new URL(fileName, scriptUrl);

    document.body.appendChild(script);
  };

  const remoteUrl = new URL('{{PANE_ROOT}}/index.html', scriptUrl);

  remoteUrl.searchParams.set('inspectedWindowURL', window.location.origin);

  window.emberInspector = {
    w: window.open(remoteUrl, 'ember-inspector'),
    url: remoteUrl.origin,
  };

  if (!window.emberInspector.w) {
    alert(
      'Unable to open the inspector in a popup. Please enable popups and retry.',
    );

    return;
  }

  /**
   * Handle Ember version mismatch. Re-injects another version of ember-debug.
   */
  window.addEventListener('message', function ({ origin, data }) {
    if (origin !== window.emberInspector.url) {
      return;
    }

    if (data.name === 'version-mismatch') {
      inject(`panes-${data.version.replace(/\./g, '-')}/ember_debug.js`);
    }
  });

  document.documentElement.dataset.emberExtension = 1;

  inject('{{PANE_ROOT}}/ember_debug.js');
})();
