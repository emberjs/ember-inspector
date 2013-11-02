const self = require("sdk/self");
var tabs = require("sdk/tabs");
var workers = require("sdk/content/worker");

var { Cu, Cc, Ci } = require("chrome");

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "gDevTools",
                                  "resource:///modules/devtools/gDevTools.jsm");

/* Depending on the version of Firefox, promise module can have different path */
try { Cu.import("resource://gre/modules/commonjs/promise/core.js"); } catch(e) {}
try { Cu.import("resource://gre/modules/commonjs/sdk/core/promise.js"); } catch(e) {}

XPCOMUtils.defineLazyGetter(this, "osString",
                            function() Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS);

var Promise = require("sdk/core/promise");

function log() {
  var args = Array.prototype.slice.call(arguments, 0);
  console.debug.apply(console, ["ember-extension: "].concat(args));
}

exports.devtoolTabDefinition = {
  id: "ember-inspector",
  ordinal: 7,
  icon: self.data.url("images/icon16.png"),
  url: self.data.url("devtool-panel.html"),
  label: "Ember",
  tooltip: "Ember Inspector",

  isTargetSupported: function(target) {
    return target.isLocalTab;
  },

  build: function(iframeWindow, toolbox) {
    // init devtool tab
    EmberInspector.initialize(iframeWindow, toolbox);
    return Promise.resolve(EmberInspector);
  }
};

let trackTabWorkers = new WeakMap();

let EmberInspector = {
  initialize: function (iframeWindow, toolbox) {
    console.debug("initialize");
    this.workers = {};
    this.iframeWindow = iframeWindow.document.querySelector("iframe");
    this.iframeWindow.setAttribute("src", self.data.url("panes/index.html"));
    this.toolbox = toolbox;

    this._onDevtoolPanelLoad = this._attachDevtoolPanel.bind(this);
    this.iframeWindow.addEventListener("load", this._onDevtoolPanelLoad, true);

    this._onTargetTabLoad = this._attachTargetTab.bind(this);
    tabs.activeTab.on("load", this._onTargetTabLoad);

    tabs.activeTab.reload();
  },

  destroy: function () {
    log("destroy");
    tabs.activeTab.removeListener("load", this._onTargetTabLoad);
    this.iframeWindow.removeEventListener("load", this._onDevtoolPanelLoad, true);
    this._cleanupWorkers();
    this.iframeWindow.setAttribute("src", "about:blank");
  },

  _cleanupWorkers: function () {
    if (this.workers.devtoolPanel) {
      this.workers.devtoolPanel.port.removeListener("message", this._handleDevtoolPanelMessage);
      this.workers.devtoolPanel.destroy();
      this.workers.devtoolPanel = null;
      log("destroy devtoolPanel worker");
    }

    if (this.workers.targetTab) {
      this.workers.targetTab.port.removeListener("message", this._handleTargetTabMessage);
      this.workers.targetTab.destroy();
      this.workers.targetTab = null;
      log("destroy targetTab worker");
    }
  },

  _attachDevtoolPanel: function() {
    log("_attachDevtoolPanel");
    var worker = this.workers.devtoolPanel;

    if (worker) {
      worker.port.removeListener("message", this._handleDevtoolPanelMessage);
      worker.destroy();
    }

    worker = workers.Worker({
      window: this.iframeWindow.contentWindow,
      contentScriptFile: self.data.url("devtool-content-script.js")
    });

    worker.port.on("message", this._handleDevtoolPanelMessage.bind(this));

    // request ember_debug inject into the target tab
    this._sendToTargetTab({ emberDebugUrl: self.data.url("ember_debug/ember_debug.js") });

    return this.workers.devtoolPanel = worker;
  },

  _detachDevtoolPanel: function() {
    log("_detachDevtoolPanel");
    var worker = this.workers.devtoolPanel;
    this.workers.devtoolPanel = null;
    if (worker) {
      worker.port.removeListener("message", this._handleDevtoolPanelMessage);
      worker.destroy();
    }
  },

  _attachTargetTab: function() {
    log("_attachTargetTab");
    var worker = this.workers.targetTab;

    if (worker) {
      worker.port.removeListener("message", this._handleTargetTabMessage);
      worker.destroy();
    }

    worker = tabs.activeTab.attach({
      window: tabs.activeTab._contentWindow,
      contentScriptFile: self.data.url("content-script.js")
    });

    worker.port.on("message", this._handleTargetTabMessage.bind(this));

    this.workers.targetTab = worker;

    this._detachDevtoolPanel();
    this.iframeWindow.contentWindow.location.reload(true);

    return this.workers.targetTab;
  },

  _handleDevtoolPanelMessage: function(msg) {
    log("_handleDevtoolPanelMessage", JSON.stringify(msg));

    this._sendToTargetTab(msg);
  },

  _handleTargetTabMessage: function(msg) {
    log("_handleTargetTabMessage", JSON.stringify(msg));

    if (msg.type === "view:devtools:inspectDOMElement") {
      // polyfill missing inspect function in content-script
      this._inspectDOMElement(msg.elementSelector);
    } else {
      // route to devtool panel
      this._sendToDevtoolPanel(msg);
    }
  },

  _sendToDevtoolPanel: function(msg) {
    log("_sendToDevtoolPanel", JSON.stringify(msg));
    if (this.workers.devtoolPanel) {
      // route to devtool panel
      this.workers.devtoolPanel.port.emit("message", msg);
    }
  },

  _sendToTargetTab: function(msg) {
    log("_sendToTargetTab", JSON.stringify(msg));
    if (this.workers.targetTab) {
      // route to ember debug
      this.workers.targetTab.port.emit("message", msg);
    }
  },

  _inspectDOMElement: function(selector) {
    log("activating inspector devtool panel...");
    let target = this.toolbox._target;
    return gDevTools.showToolbox(target, "inspector").then(function(toolbox) {
      log("inspector devtool panel activated");
      let sel = toolbox.getCurrentPanel().selection;
      log("selecting ", selector);
      sel.setNode(sel.document.querySelector(selector), "ember-inspector");
    }.bind(this));
  }
};
