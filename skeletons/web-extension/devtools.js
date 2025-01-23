/*global chrome*/

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
);
