/* eslint no-empty:0 */
import PortMixin from "ember-debug/mixins/port-mixin";
var Ember = window.Ember;
var computed = Ember.computed;
var oneWay = computed.oneWay;

var GeneralDebug = Ember.Object.extend(PortMixin, {
  namespace: null,

  port: oneWay('namespace.port').readOnly(),

  application: oneWay('namespace.application').readOnly(),

  promiseDebug: oneWay('namespace.promiseDebug').readOnly(),

  portNamespace: 'general',

  // Keep an eye on https://github.com/ember-cli/ember-cli/issues/3045
  emberCliConfig: computed(function() {
    var config;
    var $ = Ember.$;
    $('meta[name]').each(function() {
      var meta = $(this);
      var match = meta.attr('name').match(/environment$/);
      if (match) {
        try {
          /* global unescape */
          config = JSON.parse(unescape(meta.attr('content')));
          return false;
        } catch (e) {}
      }
    });
    return config;
  }).property(),


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
