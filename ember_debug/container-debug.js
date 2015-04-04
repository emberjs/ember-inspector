import PortMixin from "ember-debug/mixins/port-mixin";
var Ember = window.Ember;
var EmberObject = Ember.Object;
var computed = Ember.computed;
var oneWay = computed.oneWay;

export default EmberObject.extend(PortMixin, {
  namespace: null,

  port: oneWay('namespace.port').readOnly(),
  application: oneWay('namespace.application').readOnly(),
  objectInspector: oneWay('namespace.objectInspector').readOnly(),

  container: computed(function() {
    return this.get('application.__container__');
  }).property('application'),

  portNamespace: 'container',

  TYPES_TO_SKIP: computed(function() {
    return [
      'component-lookup',
      'container-debug-adapter',
      'resolver-for-debugging',
      'event_dispatcher'
    ];
  }).property(),

  typeFromKey: function(key) {
    return key.split(':').shift();
  },

  nameFromKey: function(key) {
    return key.split(':').pop();
  },

  shouldHide: function(type) {
    return type[0] === '-' || this.get('TYPES_TO_SKIP').indexOf(type) !== -1;
  },

  instancesByType: function() {
    var key, instancesByType = {};
    var cache = this.get('container').cache;
    // Detect if InheritingDict (from Ember < 1.8)
    if (typeof cache.dict !== 'undefined' && typeof cache.eachLocal !== 'undefined') {
      cache = cache.dict;
    }
    for (key in cache) {
      var type = this.typeFromKey(key);
      if (this.shouldHide(type) ){ continue; }
      if (instancesByType[type] === undefined) {
        instancesByType[type] = [];
      }
      instancesByType[type].push({
        fullName: key,
        instance: cache[key]
      });
    }
    return instancesByType;
  },

  getTypes: function() {
    var key, types = [];
    var instancesByType = this.instancesByType();
    for (key in instancesByType) {
      types.push({ name: key, count: instancesByType[key].length });
    }
    return types;
  },

  getInstances: function(type) {
    var instances = this.instancesByType()[type];
    if (!instances) {
      return null;
    }
    return instances.map(function(item) {
      return {
        name: this.nameFromKey(item.fullName),
        fullName: item.fullName,
        inspectable: this.get('objectInspector').canSend(item.instance)
      };
    }.bind(this));
  },

  messages: {
    getTypes: function() {
      this.sendMessage('types', {
        types: this.getTypes()
      });
    },
    getInstances: function(message) {
      var instances = this.getInstances(message.containerType);
      if (instances) {
        this.sendMessage('instances', {
          instances: instances,
          status: 200
        });
      } else {
        this.sendMessage('instances', {
          status: 404
        });
      }
    },
    sendInstanceToConsole: function(message) {
      var instance = this.get('container').lookup(message.name);
      this.get('objectToConsole').sendValueToConsole(instance);
    }
  }
});
