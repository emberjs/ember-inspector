/**
  The adapter stores logic specific to
  each environment.
  Extend this object with env specific
  code (such as chrome/firefox/test), then
  set the `adapter` property to the name
  of this adapter.

  example:

  ```javascript
  var EmberExtension = App.create({
    adapter: 'chrome'
  })
  ```
**/
export default Ember.Object.extend({
  /**
    Used to send messages to EmberDebug

    @param type {Object} the message to the send
  **/
  sendMessage: function(options) {},

  /**
    Register functions to be called
    when a message from EmberDebug is received
  **/
  onMessageReceived: function(callback) {
    this.get('_messageCallbacks').pushObject(callback);
  },

  _messageCallbacks: function() { return []; }.property(),

  _messageReceived: function(message) {
    this.get('_messageCallbacks').forEach(function(callback) {
      callback.call(null, message);
    });
  }
});
