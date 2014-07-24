import BasicAdapter from "adapters/basic";

var DevAdapter = BasicAdapter.extend({
  sendMessage: function(options) {
    options = options || {};
    this.get('port').postMessage(options);
  },

  _connect: Ember.on('init', function() {
    var adapter = window.EmberExtension.__container__.lookup('adapter:main'),
        port = adapter.get('debugPort'),
        self = this;

    port.onmessage = function(event) {
      self._messageReceived(event.data);
    };

    this.set('port', port);

    port.start();
  })
});

export default DevAdapter;
