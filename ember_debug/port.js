var Ember = window.Ember;
var oneWay = Ember.computed.oneWay;
var guidFor = Ember.guidFor;
var run = Ember.run;

export default Ember.Object.extend(Ember.Evented, {
  adapter: oneWay('namespace.adapter').readOnly(),

  application: oneWay('namespace.application').readOnly(),

  uniqueId: Ember.computed(function() {
    return guidFor(this.get('application')) + '__' + window.location.href + '__' + Date.now();
  }).property('application'),

  init: function() {
    var self = this;
    this.get('adapter').onMessageReceived(function(message) {
      if (self.get('uniqueId') === message.applicationId || !message.applicationId) {
        self.messageReceived(message.type, message);
      }
    });
  },

  messageReceived: function(name, message) {
    var self = this;
    this.wrap(function() {
      self.trigger(name, message);
    });
  },

  send: function(messageType, options) {
    options.type = messageType;
    options.from = 'inspectedWindow';
    options.applicationId = this.get('uniqueId');
    this.get('adapter').send(options);
  },

  /**
   * Wrap all code triggered from outside of
   * EmberDebug with this method.
   *
   * `wrap` is called by default
   * on all callbacks triggered by `port`,
   * so no need to call it in this case.
   *
   * - Wraps a callback in `Ember.run`.
   * - Catches all errors during production
   * and displays them in a user friendly manner.
   *
   * @method wrap
   * @param {Function} fn
   * @return {Mixed} The return value of the passed function
   */
  wrap: function(fn) {
    return run(this, function() {
      try {
        return fn();
      } catch (error) {
        this.get('adapter').handleError(error);
      }
    });
  }
});

