const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

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

      this._iframe.addEventListener("load",
                                    this._onEmberIspectorIframeLoaded.bind(this),
                                    true);
      document.addEventListener("ember-inspector-message",
                                this._onEmberInspectorMessageEvent.bind(this),
                                false, true);

      this._iframe.setAttribute("src", embedIframeSrc);
      console.debug("INIT EMBER INSPECTOR DONE\n");
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

  _onEmberIspectorIframeLoaded: function () {
    console.debug("ember inspector iframe loaded");
    this._sendToEmberInspector({ emberInspectorPanel: true });
  },

  _onEmberInspectorMessageEvent: function(evt) {
    console.debug("devtool iframe -> devtool panel", evt.detail);
    var iframe = this._iframe;
    if (evt.detail.type && evt.detail.type === "injectEmberDebug") {
      this._onInjectEmberDebug();
    } else {
      this._sendToEmberDebug(evt.detail);
    }
  },

  _onInjectEmberDebug: function() {
    var activeTab = this._tabs.activeTab;

    activeTab.on("load", this._emberDebugTabAttach.bind(this));
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

  _onEmberDebugMessage: function (message) {
    console.debug("ember debug -> devtool iframe", message);
    if (message.ready) {
      let emberDebugUrl = this._resources.url("ember_debug/ember_debug.js");
      this._sendToEmberDebug({ emberDebugUrl: emberDebugUrl });
    } else {
      this._sendToEmberInspector(message);
    }
  },

  destroy: function () {
      var iframe = document.getElementById("ember-inspector-iframe");
      iframe.setAttribute("src", "about:blank");
  }
};
