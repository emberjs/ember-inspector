var PortMixin = Ember.Mixin.create({
  port: null,
  messages: {},

  init: function() {
    this.setupPortListeners();
  },

  willDestroy: function() {
    this.removePortListeners();
  },

  setupPortListeners: function() {
    var port = this.get('port'),
        self = this,
        messages = this.get('messages');

    for (var name in messages) {
      if(messages.hasOwnProperty(name)) {
        port.on(name, this, messages[name]);
      }
    }
  },

  removePortListeners: function() {
    var port = this.get('port'),
        self = this,
        messages = this.get('messages');

    for (var name in messages) {
      if(messages.hasOwnProperty(name)) {
        port.off(name, this, messages[name]);
      }
    }
  }
});

export = PortMixin;
