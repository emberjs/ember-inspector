var Port = Ember.Object.extend(Ember.Evented, {
  adapter: Ember.computed.alias('namespace.adapter'),

  init: function() {
    var self = this;
    this.get('adapter').onMessageReceived(function(message) {
      self.trigger(message.type, message);
    });
  },
  send: function(messageType, options) {
    options.type = messageType;
    options.from = 'inspectedWindow';
    this.get('adapter').sendMessage(options);
  }
});

export default Port;
