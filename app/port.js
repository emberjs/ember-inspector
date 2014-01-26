export default Ember.Object.extend(Ember.Evented, {
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
