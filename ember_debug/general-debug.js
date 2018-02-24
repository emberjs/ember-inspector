/* eslint no-empty:0 */
import PortMixin from "ember-debug/mixins/port-mixin";
const Ember = window.Ember;
const { computed, Object: EmberObject, A } = Ember;
let { libraries } = Ember;
const { readOnly } = computed;

const GeneralDebug = EmberObject.extend(PortMixin, {
  /**
   * Passed on creation.
   *
   * @type {EmberDebug}
   */
  namespace: null,

  /**
   * Used by PortMixin.
   *
   * @type {Port}
   */
  port: readOnly('namespace.port'),

  /**
   * Used by the PortMixin
   *
   * @type {String}
   */
  portNamespace: 'general',

  /**
   * @type {Application}
   */
  application: readOnly('namespace.application'),

  // Keep an eye on https://github.com/ember-cli/ember-cli/issues/3045
  emberCliConfig: computed(function() {
    let config;
    let metas = document.querySelectorAll('meta[name]');
    for (let i = 0; i < metas.length; i++) {
      let meta = metas[i];
      let match = meta.getAttribute('name').match(/environment$/);
      if (match) {
        try {
          /* global unescape */
          config = JSON.parse(unescape(meta.attr('content')));
          return false;
        } catch (e) {}
      }
    }
    return config;
  }),

  /**
   * Sends a reply back indicating if the app has been booted.
   *
   * `__inspector__booted` is a property set on the application instance
   * when the ember-debug is inserted into the target app.
   * see: startup-wrapper.
   */
  sendBooted() {
    this.sendMessage('applicationBooted', {
      booted: this.get('application.__inspector__booted')
    });
  },

  /**
   * Sends a reply back indicating that ember-debug has been reset.
   * We need to reset ember-debug to remove state between tests.
   */
  sendReset() {
    this.sendMessage('reset');
  },

  messages: {
    /**
     * Called from the inspector to check if the inspected app has been booted.
     */
    applicationBooted() {
      this.sendBooted();
    },

    /**
     * Called from the inspector to fetch the libraries that are displayed in
     * the info tab.
     */
    getLibraries() {
      // Ember has changed where the array of libraries is located.
      // In older versions, `Ember.libraries` was the array itself,
      // but now it's found under _registry.
      if (libraries._registry) {
        libraries = libraries._registry;
      }

      this.sendMessage('libraries', { libraries: arrayize(libraries) });
    },

    refresh() {
      window.location.reload();
    }
  }
});

function arrayize(enumerable) {
  return A(enumerable).map(item => item);
}

export default GeneralDebug;
