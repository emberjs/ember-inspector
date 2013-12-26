import PortMixin from 'mixins/port_mixin';

var PromiseDebug = Ember.Object.extend(PortMixin, {
  namespace: null,
  port: Ember.computed.alias('namespace.port'),
  objectInspector: Ember.computed.alias('namespace.objectInspector'),
  portNamespace: 'promise',

  promiseAssembler: Ember.computed.alias('namespace.promiseAssembler'),

  releaseMethods: Ember.computed(function() { return Ember.A(); }),

  willDestroy: function() {
    this.releaseAll();
    this._super();
  },

  messages: {
    getAndObservePromises: function() {
      this.getAndObservePromises();
    },

    releasePromises: function() {
      this.releaseAll();
    },

    sendValueToConsole: function(message) {
      var promiseId = message.promiseId;
      var promise = this.get('promiseAssembler').find(promiseId);
      var value = promise.get('value');
      if (value === undefined) {
        value = promise.get('reason');
      }
      this.get('objectInspector').sendValueToConsole(value);
    }
  },

  releaseAll: function() {
    this.get('releaseMethods').forEach(function(fn) {
      fn();
    });
    this.set('releaseMethods', Ember.A());
  },

  getAndObservePromises: function() {
    this.get('promiseAssembler').on('created', this, this.promiseUpdated);
    this.get('promiseAssembler').on('fulfilled', this, this.promiseUpdated);
    this.get('promiseAssembler').on('rejected', this, this.promiseUpdated);
    this.get('promiseAssembler').on('chained', this, this.promiseChained);

    this.get('releaseMethods').pushObject(function() {

      this.get('promiseAssembler').off('created', this, this.promiseUpdated);
      this.get('promiseAssembler').off('fulfilled', this, this.promiseUpdated);
      this.get('promiseAssembler').off('rejected', this, this.promiseUpdated);
      this.get('promiseAssembler').off('fulfilled', this, this.promiseChained);

    }.bind(this));

    this.get('updatedPromises').pushObjects(this.get('promiseAssembler').find());
    this.promisesUpdated();
  },

  updatedPromises: Ember.computed(function() { return Ember.A(); }),

  promisesUpdated: function() {
    var updatedPromises = this.get('updatedPromises');
    var uniquePromises = Ember.A();
    updatedPromises.forEach(function(promise) {
      if (uniquePromises.indexOf(promise) === -1) {
        uniquePromises.pushObject(promise);
      }
    });
    this.sendMessage('promisesUpdated', {
      promises: this.serializeArray(uniquePromises)
    });
    this.set('updatedPromises', Ember.A());
  },

  promiseUpdated: function(event) {
    this.get('updatedPromises').pushObject(event.promise);
    Ember.run.debounce(this, 'promisesUpdated', 100);
  },

  promiseChained: function(event) {
    this.get('updatedPromises').pushObject(event.promise);
    this.get('updatedPromises').pushObject(event.child);
    Ember.run.debounce(this, 'promisesUpdated', 100);
  },

  serializeArray: function(promises) {
    return promises.map(function(item) {
      return this.serialize(item);
    }.bind(this));
  },

  serialize: function(promise) {
    var serialized = {};
    serialized.guid = promise.get('guid');
    serialized.state = promise.get('state');
    serialized.label = promise.get('label');
    if (promise.get('children')) {
      serialized.children = this.promiseIds(promise.get('children'));
    }
    serialized.parent = promise.get('parent.guid');
    serialized.value = this.inspectValue(promise.get('value'));
    serialized.reason = this.inspectValue(promise.get('reason'));
    if (promise.get('createdAt')) {
      serialized.createdAt = promise.get('createdAt').getTime();
    }
    if (promise.get('settledAt')) {
      serialized.settledAt = promise.get('settledAt').getTime();
    }
    return serialized;
  },

  promiseIds: function(promises) {
    return promises.map(function(promise) {
      return promise.get('guid');
    });
  },

  inspectValue: function(value) {
    var objectInspector = this.get('objectInspector'),
        inspected = objectInspector.inspectValue(value);

    if (inspected.type === 'type-ember-object' || inspected.type === "type-array") {
      inspected.objectId = objectInspector.retainObject(value);
      this.get('releaseMethods').pushObject(function() {
        objectInspector.releaseObject(inspected.objectId);
      });
    }
    return inspected;
  }

});

export default PromiseDebug;
