import Ember from "ember";
import BasicAdapter from "./basic";

export default BasicAdapter.extend({
  name: 'firefox',

  sendMessage: function(options) {
    options = options || {};
    window.parent.postMessage(options, "*");
  },

  _connect: function() {
    // NOTE: chrome adapter sends a appId message on connect (not needed on firefox)
    //this.sendMessage({ appId: "test" });
    this._onMessage = this._onMessage.bind(this);
    window.addEventListener("message", this._onMessage, false);

  }.on('init'),

  _onMessage: function (evt) {
    if (this.isDestroyed || this.isDestroying) {
      window.removeEventListener("message", this._onMessage, false);
      return;
    }

    var message = evt.data;
    // check if the event is originated by our privileged ember inspector code
    if (evt.isTrusted) {
      if (typeof message.type === 'string' && message.type === 'iframes') {
        this._sendIframes(message.urls);
      } else {
        // We clone the object so that Ember prototype extensions
        // are applied.
        this._messageReceived(Ember.$.extend(true, {}, message));
      }
    } else {
      console.log("EMBER INSPECTOR: ignored post message", evt);
    }
  },

  _sendIframes: function (urls) {
     var self = this;
     urls.forEach(function(url) {
       self.sendMessage({ type: "injectEmberDebug", frameURL: url });
     });
  },

  canOpenResource: true,

  openResource: function(file, line) {
    this.sendMessage({
      type: 'devtools:openSource',
      url: file,
      line: line
    });
  }

});
