var { Cu, Cc, Ci } = require("chrome");

const self = require("sdk/self");

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "gDevTools",
                                  "resource:///modules/devtools/gDevTools.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "gDevToolsBrowser",
                                  "resource:///modules/devtools/gDevTools.jsm");

var Promise = require("sdk/core/promise.js");

const { getMostRecentBrowserWindow } = require("sdk/window/utils");

exports.registerDevTool = function (toolDef) {
  gDevTools.registerTool(toolDef);
};

exports.unregisterDevTool = function (toolDef) {
  gDevTools.unregisterTool(toolDef);
};

exports.openDevTool = function(toolId) {
  let activeBrowserWindow = getMostRecentBrowserWindow();
  let { gBrowser } = activeBrowserWindow;
  return gDevToolsBrowser.selectToolCommand(gBrowser, toolId);
};

exports.inspectDOMElement = function(target, selector, toolId) {
  return gDevTools.showToolbox(target, "inspector").then(function(toolbox) {
    let sel = toolbox.getCurrentPanel().selection;
    sel.setNode(sel.document.querySelector(selector), toolId);
  }.bind(this));
};

exports.evaluateFileOnTargetWindow = function(target, fileUrl) {
  let { resolve, reject, promise } = Promise.defer();

  let fileSource = self.data.load(fileUrl);

  // evaluate ember_debug source in the target tab
  // (and resolve/reject accordingly)
  consoleFor(target).
    then(({webconsoleClient, debuggerClient}) => {
      webconsoleClient.evaluateJS(fileSource, (res) => {
        if (res.error || res.exception) {
          reject(res.error, res.exception);
        } else {
          resolve(res);
        }
      }, { url: self.data.url(fileUrl) });
    }, () => reject("consoleFor rejected"));

  return promise;
};

function consoleFor(target) {
  if (!target.client) {
    return target.makeRemote().then(() => {
      consoleFor(target);
    }, (e) => {
      throw e;
    });
  }

  let { client, form: { consoleActor } } = target;

  let { resolve, reject, promise } = Promise.defer();

  client.attachConsole(consoleActor, [], (res, webconsoleClient) => {
    if (res.error) {
      reject(res.error);
    } else {
      resolve({
        webconsoleClient: webconsoleClient,
        debuggerClient: client
      });
    }
  });

  return promise;
};
