/* globals requireModule */
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

  /**
   * Uses the current build's config module to determine
   * the environment.
   *
   * @property environment
   * @type {String}
   */
  environment: computed(function() {
    return requireModule('ember-debug/config')['default'].environment;
  }),

  debug: function() {
    return console.debug.apply(console, arguments);
  },

  log: function() {
    return console.log.apply(console, arguments);
  },

  /**
   * A wrapper for `console.warn`.
   *
   * @method warn
   */
  warn: function() {
    return console.warn.apply(console, arguments);
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
   * Handle an error caused by EmberDebug.
   *
   * This function rethrows in development and test envs,
   * but warns instead in production.
   *
   * The idea is to control errors triggered by the inspector
   * and make sure that users don't get mislead by inspector-caused
   * bugs.
   *
   * @method handleError
   * @param {Error} error
   */
  handleError: function(error) {
    if (this.get('environment') === 'production') {
      if (error && error instanceof Error) {
        error = 'Error message: ' + error.message + '\nStack trace: ' + error.stack;
      }
      this.warn('Ember Inspector has errored.\n' +
        'This is likely a bug in the inspector itself.\n' +
        'You can report bugs at https://github.com/emberjs/ember-inspector.\n' +
        error);
    } else {
      this.warn('EmberDebug has errored:');
      throw error;
    }
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
