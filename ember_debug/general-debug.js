import PortMixin from "ember-debug/mixins/port-mixin";
var Ember = window.Ember;
var GeneralDebug = Ember.Object.extend(PortMixin, {
  namespace: null,

  port: Ember.computed.alias('namespace.port'),

  application: Ember.computed.alias('namespace.application'),

  promiseDebug: Ember.computed.alias('namespace.promiseDebug'),

  portNamespace: 'general',

  sendBooted: function() {
    this.sendMessage('applicationBooted', {
      booted: this.get('application.__inspector__booted')
    });
  },

  sendReset: function() {
    this.sendMessage('reset', {
      reset: true
    });
  },

  messages: {
    applicationBooted: function() {
      this.sendBooted();
    },
    getLibraries: function() {
      var libraries = Ember.libraries;

      // Ember has changed where the array of libraries is located.
      // In older versions, `Ember.libraries` was the array itself,
      // but now it's found under _registry.
      if (libraries._registry) {
        libraries = libraries._registry;
      }

      this.sendMessage('libraries', { libraries: arrayize(libraries) });
    },
    refresh: function() {
      window.location.reload();
    }
  }
});

function arrayize(enumerable) {
  return Ember.A(enumerable).map(function(item) {
    return item;
  });
}

export default GeneralDebug;
