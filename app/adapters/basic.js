/**
 * The adapter stores logic specific to each environment.
 * Extend this object with env specific code (such as chrome/firefox/test),
 * then set the application's `adapter` property to the name of this adapter.
 *
 * example:
 *
 * ```javascript
 * const EmberInspector = App.Create({
 *   adapter: 'chrome'
 * });
 * ```
 */
import Ember from "ember";
const K = Ember.K;
export default Ember.Object.extend({
  name: 'basic',
  /**
    Used to send messages to EmberDebug

    @param type {Object} the message to the send
  **/
  sendMessage: function() {},

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
  },

  // Called when the "Reload" is clicked by the user
  willReload: K,

  canOpenResource: false,
  openResource: function(/* file, line */) {}

});
