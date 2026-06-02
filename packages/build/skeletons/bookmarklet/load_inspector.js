(() => {
  'use strict';

  const baseUrl = document.currentScript.src.replace(/\/load_inspector.js$/, '');

  const inject = (fileName) => {
    const script = document.createElement('script');

    script.type = 'module';
    script.src = `${baseUrl}/${fileName}`;
    document.body.appendChild(script);
  }

  const remoteUrl = new URL(baseUrl);

  remoteUrl.pathname += '/{{PANE_ROOT}}/index.html';
  remoteUrl.searchParams.set('inspectedWindowURL', window.location.origin.toString());

  window.emberInspector = {
    w: window.open(remoteUrl, 'ember-inspector'),
    url: remoteUrl.origin,
  };

  if (!window.emberInspector.w) {
    alert('Unable to open the inspector in a popup. Please enable popups and retry.');

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
