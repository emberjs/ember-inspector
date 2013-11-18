import PortMixin from 'mixins/port_mixin';
import PromiseAssembler from 'lib/promise_assembler';

var PromiseDebug = Ember.Object.extend(PortMixin, {
  namespace: null,
  port: Ember.computed.alias('namespace.port'),
  objectInspector: Ember.computed.alias('namespace.objectInspector'),
  portNamespace: 'promise',

  promiseAssembler: Ember.computed.alias('namespace.promiseAssembler'),

  releaseMethods: Ember.computed(function() { return Ember.A(); }).property(),

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
    this.get('releaseMethods').forEach(function(release) {
      release();
    });
  },

  getAndObservePromises: function() {

    var self = this, releaseMethods = Ember.A(),
        promises = this.get('promiseAssembler').find(), release,
        promisesToAdd = promises, promisesToUpdate = Ember.A();

    var promisesAdded = function() {
      self.sendMessage('promisesAdded', {
        promises: promisesToAdd.map(function(promise) {
          releaseMethods.push(self.observePromise(promise, promiseUpdated));
          return self.serialize(promise);
        })
      });
      promisesToAdd = Ember.A();
    };

    var promiseUpdated = function(promise) {
      promisesToUpdate.push(promise);
      Ember.run.once(null, promisesUpdated);
    };

    var promisesUpdated = function() {
      self.sendMessage('promisesUpdated', {
        promises: promisesToUpdate.map(self.serialize.bind(self))
      });
      promisesToUpdate = Ember.A();
    };

    var contentDidChange = function(array, idx, removedCount, addedCount) {
      for (var i = idx; i < idx + addedCount; i++) {
        var promise = array.objectAt(i);
        promisesToAdd.push(promise);
      }
      Ember.run.once(null, promisesAdded);
    };

    var observer = { didChange: contentDidChange, willChange: Ember.K };
    promises.addArrayObserver(self, observer);

    release = function() {
      promisesToAdd = Ember.A();
      promisesToUpdate = Ember.A();
      releaseMethods.forEach(function(fn) { fn(); });
      promises.removeArrayObserver(self, observer);
      self.get('releaseMethods').removeObject(release);
    };

    promisesAdded();

    this.get('releaseMethods').pushObject(release);

    return release;
  },

  observePromise: function(promise, callback) {
    var releaseMethods = Ember.A(), self = this,
        keysToObserve = Ember.A(['state', 'label', 'value', 'reason', 'children', 'parent']),
        children = promise.get('children');

    keysToObserve.forEach(function(key) {
      var handler = function() {
        callback(promise);
      };
      Ember.addObserver(promise, key, handler);
      releaseMethods.push(function() {
        Ember.removeObserver(promise, key, handler);
      });
    });


    if (children) {
      var onChange = function() {
        callback(promise);
      };

      var observer = {
        didChange: function() {
          Ember.run.scheduleOnce('actions', this, onChange);
        },
        willChange: Ember.K
      };

      children.addArrayObserver(this, observer);

      releaseMethods.push(function() {
        children.removeArrayObserver(self, observer);
      });
    }

    var release = function() {
      releaseMethods.forEach(function(fn) { fn(); } );
    };

    return release;
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
    serialized.value = this.inspectValue(promise.get('value'));
    serialized.reason = this.inspectValue(promise.get('reason'));
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
