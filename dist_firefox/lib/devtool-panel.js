const self = require("sdk/self");
const systemEvents = require('sdk/system/events');

var Tab = require("sdk/tabs/tab-firefox").Tab;
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


// http://ejohn.org/blog/partial-functions-in-javascript/
Function.prototype.partial = function(){
  var fn = this, args = Array.prototype.slice.call(arguments);
  return function(){
    var arg = 0;
    for ( var i = 0; i < args.length && arg < arguments.length; i++ )
      if ( args[i] === undefined )
        args[i] = arguments[arg++];
    return fn.apply(this, args);
  };
};

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

let EmberInspector = {
  initialize: function (iframeWindow, toolbox) {
    log("initialize");
    this.workers = {};
    this.iframeWindow = iframeWindow.document.querySelector("iframe");
    this.toolbox = toolbox;

    log("EMBER EXTENSION TARGET", toolbox._target);

    this._onDevtoolPanelLoad = this._attachDevtoolPanel.bind(this);
    this.iframeWindow.addEventListener("load", this._onDevtoolPanelLoad, true);

    // attach target tab before any script is executed
    this._onDocumentElementInserted = (event) => {
      var document = event.subject;
      // skip if the document is not related to the target tab
      if (toolbox && document.defaultView &&
          document.defaultView === toolbox._target.window) {
        log("ATTACH WINDOW: ", toolbox._target.window.location);
        this._attachTargetTab();
      }
    };

    systemEvents.on('document-element-inserted', this._onDocumentElementInserted, true);
    this._attachTargetTab();
  },

  destroy: function () {
    log("destroy");
    systemEvents.off('document-element-inserted', this._onDocumentElementInserted);
    this.iframeWindow.removeEventListener("load", this._onDevtoolPanelLoad, true);
    this._cleanupWorkers();
  },

  _injectEmberDebug: function() {
    var deferred = Promise.defer();

    // get the ember_debug source
    this.emberDebugSource = this.emberDebugSource || self.data.load("ember_debug/ember_debug.js");

    // evaluate ember_debug source in the target tab (and resolve/reject accordingly)
    this._consoleFor(this.toolbox._target).then(({webconsoleClient, debuggerClient}) => {
      webconsoleClient.evaluateJS(this.emberDebugSource, (res) => {
        if (res.error || res.exception) {
          deferred.reject(res.error, res.exception);
        } else {
          deferred.resolve(res);
        }
      }, { url: self.data.url("ember_debug/ember_debug.js") });

    }, deferred.reject);

    return deferred.promise;
  },

  _consoleFor: function(target) {
    let consoleActor = target.form.consoleActor;
    let client = target.client;

    let deferred = Promise.defer();

    client.attachConsole(consoleActor, [], (res, webconsoleClient) => {
      if (res.error) {
        log("attachConsole error", res.error);
        deferred.reject(res.error);
      } else {
        deferred.resolve({
          webconsoleClient: webconsoleClient,
          debuggerClient: client
        });
      }
    });

    return deferred.promise;
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

    this.workers.devtoolPanel = worker;

    // send any message in the queue to the attached devtool panel
    this._sendToDevtoolPanel();

    return worker;
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

    worker = Tab({tab: this.toolbox._target.tab}).attach({
      window: this.toolbox._target.window,
      contentScriptFile: self.data.url("content-script.js")
    });

    worker.port.on("message", this._handleTargetTabMessage.bind(this));

    this.workers.targetTab = worker;

    // inject ember_debug.js in the target tag
    // and reload the devtool panel
    this._injectEmberDebug().then(
      log.partial("ember debug injected"),
      log.partial("error injecting ember debug")
    ).then(() => {
      log("reloading devtool panel");
      this._detachDevtoolPanel();
      this.iframeWindow.contentWindow.location.reload(true);
    });

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

    // define message queue if it's not defined
    this.mqDevtool = this.mqDevtool || [];

    if (msg) {
      // push message in the queue if any
      this.mqDevtool.push(msg);
    }

    if (this.workers.devtoolPanel) {
      // drain message queue
      let nextMsg;
      while ((nextMsg = this.mqDevtool.shift())) {
        this.workers.devtoolPanel.port.emit("message", nextMsg);
      }
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
