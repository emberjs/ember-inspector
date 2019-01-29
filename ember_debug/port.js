const Ember = window.Ember;
const { Object: EmberObject, computed, run, get } = Ember;
const { oneWay } = computed;

export default EmberObject.extend(Ember.Evented, {
  adapter: oneWay('namespace.adapter').readOnly(),

  /**
   * Unique id per applciation (not application instance). It's very important
   * that this id doesn't change when the app is reset otherwise the inspector
   * will no longer recognize the app.
   *
   * @property uniqueId
   * @type {String}
   */
  uniqueId: computed('namespace._application.{name,modulePrefix}', 'namespace.applicationId', function() {
    let application = this.get('namespace._application');

    // can be set by users to provide a "pretty" name for a given app when
    // multiple applications are detected
    let name = get(application, 'name');

    // good default for "standard" ember-cli apps
    let modulePrefix = get(application, 'modulePrefix');

    // fallback to do "something" when neither name or modulePrefix are found
    let fallback = `(unknown app - ${this.get('namespace.applicationId')})`;

    return name || modulePrefix || fallback;
  }),

  init() {
    this.get('adapter').onMessageReceived(message => {
      if (this.get('uniqueId') === message.applicationId || !message.applicationId) {
        this.messageReceived(message.type, message);
      }
    });
  },

  messageReceived(name, message) {
    this.wrap(() => {
      this.trigger(name, message);
    });
  },

  send(messageType, options = {}) {
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
  wrap(fn) {
    return run(this, function() {
      try {
        return fn();
      } catch (error) {
        this.get('adapter').handleError(error);
      }
    });
  }
});
