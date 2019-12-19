const Ember = window.Ember;
const { Object: EmberObject, computed, run } = Ember;
const { or, readOnly } = computed;

export default EmberObject.extend(Ember.Evented, {
  adapter: readOnly('namespace.adapter'),
  applicationId: readOnly('namespace.applicationId'),
  applicationName: or('namespace._application.name', 'namespace._application.modulePrefix').readOnly(),

  /**
   * Unique id per application (not application instance). It's very important
   * that this id doesn't change when the app is reset otherwise the inspector
   * will no longer recognize the app.
   *
   * @property uniqueId
   * @type {String}
   */
  uniqueId: computed('namespace._application', function() {
    return Ember.guidFor(this.get('namespace._application'));
  }),

  init() {
    /**
     * Stores the timestamp when it was first accessed.
     *
     * @property now
     * @type {Number}
     */
    this.now = Date.now();

    this.get('adapter').onMessageReceived(message => {
      if (this.get('uniqueId') === message.applicationId || !message.applicationId) {
        this.messageReceived(message.type, message);
      }
    });
  },

  messageReceived(name, message) {
    // We should generally not be run-wrapping here. Starting a runloop in
    // ember-debug will cause the inspected app to revalidate/rerender. We
    // are generally not intending to cause changes to the rendered output
    // of the app, so this is generally unnecessary, and in big apps this
    // could be quite slow. There is nothing special about the `view:*`
    // messages – I (GC) just happened to have reviewed all of them recently
    // and can be quite sure that they don't need the runloop. We should
    // audit the rest of them and see if we can remove the else branch. I
    // think we most likely can. In the limited cases (if any) where the
    // runloop is needed, the callback code should just do the wrapping
    // themselves.
    if (name.startsWith('view:')) {
      try {
        this.trigger(name, message);
      } catch(error) {
        this.adapter.handleError(error);
      }
    } else {
      this.wrap(() => {
        this.trigger(name, message);
      });
    }
  },

  send(messageType, options = {}) {
    options.type = messageType;
    options.from = 'inspectedWindow';
    options.applicationId = this.get('uniqueId');
    options.applicationName = this.get('applicationName');
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
  wrap(fn) {
    return run(this, function() {
      try {
        return fn();
      } catch(error) {
        this.get('adapter').handleError(error);
      }
    });
  }
});
