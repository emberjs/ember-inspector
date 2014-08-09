import BasicAdapter from "adapters/basic";

var emberDebug = null;

export default  BasicAdapter.extend({
  name: 'bookmarklet',

  sendMessage: function(options) {
    options = options || {};
    window.opener.postMessage(options, '*');
  },

  _connect: function() {
    var self = this;

    window.addEventListener('message', function(e) {
      var message = e.data;
      // close inspector if inspected window is unloading
      if (message && message.unloading) {
        window.close();
      }
      if (message.from === 'inspectedWindow') {
        self._messageReceived(message);
      }
    });
  }.on('init'),
});
