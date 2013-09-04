var { Cu, Cc, Ci } = require("chrome");
const self = require("sdk/self");

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// Register DevTools Tab

Cu.import("resource:///modules/devtools/gDevTools.jsm");

/* Depending on the version of Firefox, promise module can have different path */
try { Cu.import("resource://gre/modules/commonjs/promise/core.js"); } catch(e) {}
try { Cu.import("resource://gre/modules/commonjs/sdk/core/promise.js"); } catch(e) {}

XPCOMUtils.defineLazyGetter(this, "osString",
                            function() Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS);

let devtoolTabDefinition = {
  id: "ember-inspector",
//  key: "E",
  ordinal: 7,
  modifiers: osString == "Darwin" ? "accel,alt" : "accel,shift",
  icon: self.data.url("images/icon16.png"),
  url: "chrome://ember-inspector/content/ember-inspector.xul",
  label: "Ember",
  tooltip: "Ember Inspector",

  isTargetSupported: function(target) {
    return target.isLocalTab;
  },

  build: function(iframeWindow, toolbox) {
    // init devtool tab
    iframeWindow.EmberInspector.initialize(toolbox, self.data.url("panes/index.html"), {
      workers: require("sdk/content/worker"),
      tabs: require("sdk/tabs"),
      resources: self.data,
      console: console
    });
    return Promise.resolve(iframeWindow.EmberInspector);
  }
};

function injectEmberDebug(messageCb) {
  console.log("INJECT EMBER DEBUG start");
  var tabs = require("sdk/tabs");

  var worker = tabs.activeTab.attach({
    contentScriptFile: self.data.url("content-script.js")
  });

  messageCb({port: worker.port, type: "emberDebugPort"});

  worker.port.on("message", function(message) {
    console.log("EMBER DEBUG message", message);
    if (message.ready) {
      worker.port.emit("message", { emberDebugUrl: self.data.url("ember_debug/ember_debug.js") });
    }
    messageCb(message);
  });
  console.log("INJECT EMBER DEBUG end");
}

function startup() {
  gDevTools.registerTool(devtoolTabDefinition);
}

function shutdown() {
  gDevTools.unregisterTool(devtoolTabDefinition);
}

startup();

exports.onUnload = function() {
  shutdown();
};
