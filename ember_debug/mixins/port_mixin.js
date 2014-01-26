export default Ember.Mixin.create({
  port: null,
  messages: {},

  portNamespace: null,

  init: function() {
    this.setupPortListeners();
  },

  willDestroy: function() {
    this.removePortListeners();
  },

  sendMessage: function(name, message) {
    this.get('port').send(this.messageName(name), message);
  },

  setupPortListeners: function() {
    var port = this.get('port'),
        self = this,
        messages = this.get('messages');

    for (var name in messages) {
      if(messages.hasOwnProperty(name)) {
        port.on(this.messageName(name), this, messages[name]);
      }
    }
  },

  removePortListeners: function() {
    var port = this.get('port'),
        self = this,
        messages = this.get('messages');

    for (var name in messages) {
      if(messages.hasOwnProperty(name)) {
        port.off(this.messageName(name), this, messages[name]);
      }
    }
  },

  messageName: function(name) {
    var messageName = name;
    if (this.get('portNamespace')) {
      messageName = this.get('portNamespace') + ':' + messageName;
    }
    return messageName;
  }
});
