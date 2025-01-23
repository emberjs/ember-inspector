/*global chrome*/

/**
 * Long lived background script running in the browser, works in tandem with the
 * client-script to coordinate messaging between EmberDebug, EmberInspector and the
 * ClientApp. The background.js script serves as a proxy between the EmberInspector
 * and the content-script.
 *
 * It is also responsible for showing the Ember icon and tooltip in the url bar.
 *
 * See:
 *     https://developer.chrome.com/extensions/background_pages
 *     https://developer.chrome.com/extensions/messaging
 */
(function () {
  'use strict';

  var activeTabs = {},
    activeTabId,
    contextMenuAdded = false,
    emberInspectorChromePorts = {};

  /**
   * Creates the tooltip string to show the version of libraries used in the ClientApp
   * @param  {Array} versions - array of library objects
   * @return {String} - string of library names and versions
   */
  function generateVersionsTooltip(versions) {
    return versions
      .map(function (lib) {
        return lib.name + ' ' + lib.version;
      })
      .join('\n');
  }

  /**
   * Creates the title for the action for the current ClientApp
   * @param {Number} tabId - the current tab
   */
  function setActionTitle(tabId) {
    void chrome.action.setTitle({
      tabId: tabId,
      title: generateVersionsTooltip(activeTabs[tabId]),
    });
  }

  /**
   * Update the tab's action: https://developer.chrome.com/extensions/pageAction
   * If the user has choosen to display it, the icon is shown and the title
   * is updated to display the ClientApp's information in the tooltip.
   * @param {Number} tabId - the current tab
   */
  function updateTabAction(tabId) {
    chrome.storage.sync.get('options', async function (data) {
      void chrome.action.enable(tabId);
      void chrome.action.setIcon({
        tabId,
        path: {
          19: '{{PANE_ROOT}}/assets/images/icon19.png',
          38: '{{PANE_ROOT}}/assets/images/icon38.png',
        },
      });
      setActionTitle(tabId);
    });
  }

  /**
   * Remove the curent tab's Ember icon.
   * Typically used to clearout the icon after reload.
   * @param {Number} tabId - the current tab
   */
  function hideAction(tabId) {
    if (!activeTabs[tabId]) {
      return;
    }

    void chrome.action.disable(tabId);
    void chrome.action.setIcon({
      tabId,
      path: {
        19: '{{PANE_ROOT}}/assets/images/icon19_grey.png',
        38: '{{PANE_ROOT}}/assets/images/icon38_grey.png',
      },
    });
  }

  function genericOnClick(info) {
    if (info.menuItemId !== 'inspect-ember-component') return;
    void chrome.tabs.sendMessage(activeTabId, {
      from: 'devtools',
      type: 'view:contextMenu',
    });
  }

  chrome.contextMenus.onClicked.addListener(genericOnClick);

  /**
   * Update the tab's contextMenu: https://developer.chrome.com/extensions/contextMenus
   * Add a menu item called "Inspect Ember Component" that shows info
   * about the component in the inspector.
   * @param {Boolean} force don't use the activeTabs array to check for an existing context menu
   */
  function updateContextMenu(force) {
    // The Chromium that Electron runs does not have a chrome.contextMenus,
    // so make sure this doesn't throw an error in Electron
    if (!chrome.contextMenus) {
      return;
    }

    // Only add context menu item when an Ember app has been detected
    var isEmberApp = !!activeTabs[activeTabId] || force;
    if (!isEmberApp && contextMenuAdded) {
      chrome.contextMenus.remove('inspect-ember-component');
      contextMenuAdded = false;
    }

    if (isEmberApp && !contextMenuAdded) {
      chrome.contextMenus.create({
        id: 'inspect-ember-component',
        title: 'Inspect Ember Component',
        contexts: ['all'],
      });
      contextMenuAdded = true;
    }
  }

  /**
   * Listen for a connection request from the EmberInspector.
   * When the EmberInspector connects to the extension a messageListener
   * is added for the specific EmberInspector instance, and saved into
   * an array, keyed by appId.
   *
   * @param {Port} emberInspectorChromePort
   */
  chrome.runtime.onConnect.addListener(function (emberInspectorChromePort) {
    var appId;

    /**
     * Listen for messages from the EmberInspector.
     * The first message is used to save the port, all others are forwarded
     * to the content-script.
     * @param {Message} message
     */
    emberInspectorChromePort.onMessage.addListener(function (message) {
      // if the message contains the appId, this is the first
      // message and the appId is used to map the port for this app.
      if (message.appId) {
        appId = message.appId;

        emberInspectorChromePorts[appId] = emberInspectorChromePort;

        emberInspectorChromePort.onDisconnect.addListener(function () {
          delete emberInspectorChromePorts[appId];
        });
      } else if (message.from === 'devtools') {
        // all other messages from EmberInspector are forwarded to the content-script
        // https://developer.chrome.com/extensions/tabs#method-sendMessage
        chrome.tabs.sendMessage(message.tabId || appId, message, {
          frameId: message.frameId,
        });
      }
    });
  });

  /**
   * Listen for messages from the content-script.
   * A few events trigger specfic behavior, all others are forwarded to EmberInspector.
   * @param {Object} request
   * @param {MessageSender} sender
   */
  chrome.runtime.onMessage.addListener(function (request, sender) {
    // only listen to messages from the content-script
    if (!sender.tab) {
      // noop
    } else if (request && request.type === 'emberVersion') {
      // set the version info and update title
      activeTabs[sender.tab.id] = request.versions;

      updateTabAction(sender.tab.id);
      updateContextMenu();
    } else if (request && request.type === 'resetEmberIcon') {
      // hide the Ember icon
      hideAction(sender.tab.id);
    } else if (request && request.type === 'inspectorLoaded') {
      updateContextMenu(true);
    } else {
      // forward the message to EmberInspector
      var emberInspectorChromePort = emberInspectorChromePorts[sender.tab.id];
      if (emberInspectorChromePort) {
        emberInspectorChromePort.postMessage(request);
      }
    }
  });

  /**
   * Keep track of which browser tab is active and update the context menu.
   */
  chrome.tabs.onActivated.addListener(({ tabId }) => {
    activeTabId = tabId;
    if (activeTabs[tabId]) {
      updateTabAction(tabId);
    }
    updateContextMenu();
  });

  /**
   * Only keep track of active tabs
   */
  chrome.tabs.onRemoved.addListener(({ tabId }) => {
    delete activeTabs[tabId];
  });
})();
