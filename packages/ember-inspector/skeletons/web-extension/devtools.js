/* global chrome */
/* eslint-disable no-unused-vars */

/**
 * Run when devtools.html is automatically added to the Chrome devtools panels.
 * It creates a new pane using the panes/index.html which includes EmberInspector.
 */
var panelWindow,
  injectedPanel = false,
  injectedPage = false,
  panelVisible = false,
  savedStack = [];

chrome.devtools.panels.create(
  '{{TAB_LABEL}}',
  '{{PANE_ROOT}}/assets/svg/ember-icon.svg',
  '{{PANE_ROOT}}/index.html',
  function (panel) {
    // Let the pane know when it is shown/hidden so it can pause expensive
    // work (like streaming the render tree) while the user is on another
    // DevTools panel. The hook is optional: older locked-version panes
    // simply don't define it.
    function notify(visible) {
      if (
        panelWindow &&
        typeof panelWindow.__emberInspectorSetPanelVisibility === 'function'
      ) {
        panelWindow.__emberInspectorSetPanelVisibility(visible);
      }
    }

    panel.onShown.addListener(function (win) {
      panelWindow = win;
      panelVisible = true;
      notify(true);
    });

    panel.onHidden.addListener(function () {
      panelVisible = false;
      notify(false);
    });
  },
);
