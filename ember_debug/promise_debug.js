import PortMixin from 'mixins/port_mixin';
import PromiseAssembler from 'lib/promise_assembler';

var PromiseDebug = Ember.Object.extend(PortMixin, {
  namespace: null,
  port: Ember.computed.alias('namespace.port'),
  objectInspector: Ember.computed.alias('namespace.objectInspector'),
  portNamespace: 'promise',

  promiseAssembler: Ember.computed.alias('namespace.promiseAssembler'),

  messages: {
    getPromises: function() {
      var promises = this.get('promiseAssembler').find();
      this.sendMessage('promises', {
        promises: this.serializeArray(promises)
      });
    }
  },

  serializedPromises: function() { return {}; }.property(),

  serialized: function(promise) {
    var obj = this.get('serializedPromises')[promise.get('guid')];
    if (!obj) {
      obj = { guid: promise.get('guid') };
      this.get('serializedPromises')[promise.get('guid')] = obj;
    }
    return obj;
  },

  serializeArray: function(promises) {
    var a = [], self = this;
    promises.forEach(function(item) {
      a.pushObject(self.serialize(item));
    });
    return a;
  },

  serialize: function(promise) {
    var serialized = this.serialized(promise);
    serialized.state = promise.get('state');
    serialized.label = promise.get('label');
    if (promise.get('children')) {
      serialized.children = this.promiseIds(promise.get('children'));
    }
    serialized.parent = promise.get('parent.guid');
    serialized.value = this.get('objectInspector').inspect(promise.get('value'));
    serialized.reason = this.get('objectInspector').inspect(promise.get('reason'));
    return serialized;
  },

  promiseIds: function(promises) {
    return promises.map(function(promise) {
      return promise.get('guid');
    });
  }

});

export default PromiseDebug;
