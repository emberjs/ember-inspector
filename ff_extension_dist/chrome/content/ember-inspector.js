const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "gDevTools",
                                  "resource:///modules/devtools/gDevTools.jsm");
var console;

let EmberInspector = {
  initialize: function (toolbox, embedIframeSrc, options) {
    try {
      var self = this;
      this._toolbox = toolbox;
      this._workers = options.workers;
      this._tabs = options.tabs;
      this._resources = options.resources;
      console = options.console;

      this._iframe = document.getElementById("ember-inspector-iframe");

      document.addEventListener("ember-inspector-message",
                                this._onEmberInspectorMessageEvent.bind(this),
                                false, true);

      this._iframe.setAttribute("src", embedIframeSrc);
      console.debug("INIT EMBER INSPECTOR DONE\n");

      this._tabs.activeTab.on("load", this._emberDebugTabAttach.bind(this));
      this._tabs.activeTab.reload();
    } catch(e) {
      console.error("EXCEPTION initializing EmberInspector", e);
    }
  },

  _sendToEmberInspector: function(msg) {
    console.debug("devtool panel -> devtool iframe", msg);
    if (this._iframe && this._iframe.contentWindow) {
      // route to ember inspector
      this._iframe.contentWindow.postMessage(msg, "*");
    }
  },

  _sendToEmberDebug: function(msg) {
    console.debug("devtool panel -> ember debug", msg);
    if (this._emberDebugWorker) {
      // route to ember debug
      this._emberDebugWorker.port.emit("message", msg);
    }
  },

  _onEmberInspectorMessageEvent: function(evt) {
    console.debug("devtool iframe -> devtool panel", evt.detail);
    this._sendToEmberDebug(evt.detail);
  },

  _emberDebugTabAttach: function (tab) {
    if (this._emberDebugWorker) {
      this._emberDebugWorker.destroy();
    };

    var worker = tab.attach({
      contentScriptFile: this._resources.url("content-script.js")
    });

    this._emberDebugWorker = worker;
    worker.port.on("message", this._onEmberDebugMessage.bind(this));

    this._iframe.contentWindow.location.reload();
  },

  _doInspectDOMElement: function(selector) {
    console.debug("activating inspector devtool panel...");
    let target = this._toolbox._target;
    return gDevTools.showToolbox(target, "inspector").then(function(toolbox) {
      console.debug("inspector devtool panel activated");
      let sel = toolbox.getCurrentPanel().selection;
      console.debug("selecting ", selector);
      sel.setNode(sel.document.querySelector(selector), "ember-inspector");
    }.bind(this));
  },

  _onEmberDebugMessage: function (message) {
    console.debug("ember debug -> devtool iframe", message);
    if (message.ready) {
      let emberDebugUrl = this._resources.url("ember_debug/ember_debug.js");
      this._sendToEmberDebug({ emberDebugUrl: emberDebugUrl });
    } else {
      switch(message.type) {
      case "view:devtools:inspectDOMElement":
        // handle dom inspection requests
        this._doInspectDOMElement(message.elementSelector);
        break;
      default:
        this._sendToEmberInspector(message);
      }
    }
  },

  destroy: function () {
      var iframe = document.getElementById("ember-inspector-iframe");
      iframe.setAttribute("src", "about:blank");

      if (this._emberDebugWorker) {
        this._emberDebugWorker.destroy();
        this._emberDebugWorker = null;
      }
  }
};
