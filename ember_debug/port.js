var Port = Ember.Object.extend(Ember.Evented, {
  init: function() {
    connect.apply(this);
  },
  send: function(messageType, options) {
    options.type = messageType;
    options.from = 'inspectedWindow';
    this.get('chromePort').postMessage(options);
  },
  chromePort: null
});


var connect = function() {
  var channel = new MessageChannel(), self = this;
  var chromePort = channel.port1;
  this.set('chromePort', chromePort);
  window.postMessage('debugger-client', [channel.port2], '*');

  chromePort.addEventListener('message', function(event) {
    var message = event.data, value;
    Ember.run(function() {
      self.trigger(message.type, message);
    });
  });

  chromePort.start();
};

export default Port;
