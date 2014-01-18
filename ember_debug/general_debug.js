import PortMixin from "mixins/port_mixin";

var GeneralDebug = Ember.Object.extend(PortMixin, {
  namespace: null,

  port: Ember.computed.alias('namespace.port'),

  application: Ember.computed.alias('namespace.application'),

  promiseDebug: Ember.computed.alias('namespace.promiseDebug'),

  portNamespace: 'general',

  sendBooted: function() {
    this.sendMessage('applicationBooted', {
      booted: Ember.BOOTED
    });
  },

  messages: {
    applicationBooted: function() {
      this.sendBooted();
    }
  }
});

export default GeneralDebug;
