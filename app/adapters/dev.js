import BasicAdapter from "adapters/basic";

export default  BasicAdapter.extend({
  name: 'dev',

  _connect: function() {
    var messageChannel = new MessageChannel(),
        port = messageChannel.port1,
        debugPort = messageChannel.port2,
        self = this;

    this.set('port', port);
    this.set('debugPort', debugPort);

    port.onmessage = function(event) {
      self._messageReceived(event.data);
    };

    port.start();
  }.on('init'),

  sendMessage: function(options) {
    options = options || {};
    this.get('port').postMessage(options);
  }
});
