import BasicAdapter from "adapters/basic";

export default BasicAdapter.extend({

  sendMessage: function(options) {
    options = options || {};
    window.parent.postMessage(options, "*");
  },

  _connect: function() {
    var self = this;
    // NOTE: chrome adapter sends a appId message on connect (not needed on firefox)
    //this.sendMessage({ appId: "test" });
    window.addEventListener("message", function(evt) {
      // check if the event is originated by our privileged ember inspector code
      if (evt.isTrusted) {
        // We clone the object so that Ember prototype extensions
        // are applied.
        self._messageReceived(Ember.$.extend(true, {}, evt.data));
      } else {
        console.log("EMBER INSPECTOR: ignored post message", evt);
      }
    }, false);
  }.on('init')
});
