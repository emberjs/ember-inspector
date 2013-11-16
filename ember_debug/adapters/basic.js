var BasicAdapter = Ember.Object.extend({
  /**
    Used to send messages to EmberExtension

    @param {Object} type the message to the send
  */
  sendMessage: function(options) {},

  /**
    Register functions to be called
    when a message from EmberExtension is received

    @param {Function} callback
  */
  onMessageReceived: function(callback) {
    this.get('_messageCallbacks').pushObject(callback);
  },

  /**
    Inspect a specific element.  This usually
    means using the current environment's tools
    to inspect the element in the DOM.

    For example, in chrome, `inspect(elem)`
    will open the Elements tab in dev tools
    and highlight the element.

    @param {DOM Element} elem
  */
  inspectElement: function(elem) {},

  _messageCallbacks: Ember.computed(function() { return Ember.A(); }).property(),

  _messageReceived: function(message) {
    this.get('_messageCallbacks').forEach(function(callback) {
      callback.call(null, message);
    });
  }
});

export default BasicAdapter;
