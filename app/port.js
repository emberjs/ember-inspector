var Port = Ember.Object.extend(Ember.Evented, {
  init: function() {
    var self = this;
    this.get('adapter').onMessageReceived(function(message) {
      self.trigger(message.type, message);
    });
  },
  send: function(type, message) {
    message = message || {};
    message.type = type;
    message.from = 'devtools';
    this.get('adapter').sendMessage(message);
  }
});


Ember.Application.initializer({
  name: "port",

  initialize: function(container, application) {
    container.register('port:main', application.Port);
    container.lookup('port:main');
  }
});

Ember.Application.initializer({
  name: "injectPort",

  initialize: function(container) {
    container.typeInjection('controller', 'port', 'port:main');
    container.typeInjection('route', 'port', 'port:main');
  }
});

export default Port;
