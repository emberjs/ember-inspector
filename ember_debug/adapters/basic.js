var Ember = window.Ember;
var computed = Ember.computed;
var $ = Ember.$;
var RSVP = Ember.RSVP;
var Promise = RSVP.Promise;

export default Ember.Object.extend({
  init: function() {
    var self = this;
    RSVP.resolve(this.connect(), 'ember-inspector').then(function() {
      self.onConnectionReady();
    }, null, 'ember-inspector');
  },

  debug: function() {
    console.debug.apply(console, arguments);
  },

  log: function() {
    console.log.apply(console, arguments);
  },

  /**
    Used to send messages to EmberExtension

    @param {Object} type the message to the send
  */
  sendMessage: function(/* options */) {},

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
  inspectElement: function(/* elem */) {},

  _messageCallbacks: Ember.computed(function() { return Ember.A(); }).property(),

  _messageReceived: function(message) {
    this.get('_messageCallbacks').forEach(function(callback) {
      callback.call(null, message);
    });
  },

  /**

    A promise that resolves when the connection
    with the inspector is set up and ready.

    @return {Promise}
  */
  connect: function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      $(function() {
        if (self.isDestroyed) { reject(); }
        self.interval = setInterval(function() {
          if (document.documentElement.dataset.emberExtension) {
            clearInterval(self.interval);
            resolve();
          }
        }, 10);
      });
    }, 'ember-inspector');
  },

  willDestroy: function() {
    this._super();
    clearInterval(this.interval);
  },

  _isReady: false,
  _pendingMessages: computed(function() { return Ember.A(); }).property(),

  send: function(options) {
    if (this._isReady) {
      this.sendMessage.apply(this, arguments);
    } else {
      this.get('_pendingMessages').push(options);
    }
  },

  /**
    Called when the connection is set up.
    Flushes the pending messages.
  */
  onConnectionReady: function() {
    // Flush pending messages
    var self = this;
    var messages = this.get('_pendingMessages');
    messages.forEach(function(options) {
      self.sendMessage(options);
    });
    messages.clear();
    this._isReady = true;
  }

});
