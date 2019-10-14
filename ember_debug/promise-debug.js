import PortMixin from 'ember-debug/mixins/port-mixin';
import PromiseAssembler from 'ember-debug/libs/promise-assembler';
const Ember = window.Ember;
const { computed, Object: EmberObject, RSVP, A, run } = Ember;
const { readOnly } = computed;

export default EmberObject.extend(PortMixin, {
  namespace: null,
  objectInspector: readOnly('namespace.objectInspector'),
  adapter: readOnly('namespace.adapter'),
  portNamespace: 'promise',
  session: readOnly('namespace.session'),

  // created on init
  promiseAssembler: null,

  releaseMethods: computed(function() { return A(); }),

  init() {
    this._super();
    this.set('promiseAssembler', PromiseAssembler.create());
    this.get('promiseAssembler').set('promiseDebug', this);
    this.setInstrumentWithStack();
    this.sendInstrumentWithStack();
    this.get('promiseAssembler').start();
  },

  delay: 100,

  willDestroy() {
    this.releaseAll();
    if (this.get('promiseAssembler')) {
      this.get('promiseAssembler').destroy();
    }
    this.set('promiseAssembler', null);
    this._super();
  },

  messages: {
    getAndObservePromises() {
      this.getAndObservePromises();
    },

    releasePromises() {
      this.releaseAll();
    },

    sendValueToConsole(message) {
      let promiseId = message.promiseId;
      let promise = this.get('promiseAssembler').find(promiseId);
      let value = promise.get('value');
      if (value === undefined) {
        value = promise.get('reason');
      }
      this.get('objectInspector').sendValueToConsole(value);
    },

    tracePromise(message) {
      let id = message.promiseId;
      let promise = this.get('promiseAssembler').find(id);
      // Remove first two lines and add label
      let stack = promise.get('stack');
      if (stack) {
        stack = stack.split("\n");
        stack.splice(0, 2, [`Ember Inspector (Promise Trace): ${promise.get('label') || ''}`]);
        this.get("adapter").log(stack.join("\n"));
      }
    },

    setInstrumentWithStack(message) {
      let bool = message.instrumentWithStack;
      this.set('instrumentWithStack', bool);
      this.setInstrumentWithStack();
    },

    getInstrumentWithStack() {
      this.sendInstrumentWithStack();
    }
  },

  instrumentWithStack: computed({
    get() {
      return !!this.get('session').getItem('promise:stack');
    },
    set(key, value) {
      this.get('session').setItem('promise:stack', value);
      return value;
    }
  }),

  sendInstrumentWithStack() {
    this.sendMessage('instrumentWithStack', {
      instrumentWithStack: this.get('instrumentWithStack')
    });
  },

  setInstrumentWithStack() {
    RSVP.configure('instrument-with-stack', this.get('instrumentWithStack'));
    this.sendInstrumentWithStack();
  },

  releaseAll() {
    this.get('releaseMethods').forEach(fn => {
      fn();
    });
    this.set('releaseMethods', A());
  },

  getAndObservePromises() {
    this.get('promiseAssembler').on('created', this, this.promiseUpdated);
    this.get('promiseAssembler').on('fulfilled', this, this.promiseUpdated);
    this.get('promiseAssembler').on('rejected', this, this.promiseUpdated);
    this.get('promiseAssembler').on('chained', this, this.promiseChained);

    this.get('releaseMethods').pushObject(() => {
      this.get('promiseAssembler').off('created', this, this.promiseUpdated);
      this.get('promiseAssembler').off('fulfilled', this, this.promiseUpdated);
      this.get('promiseAssembler').off('rejected', this, this.promiseUpdated);
      this.get('promiseAssembler').off('chained', this, this.promiseChained);
    });

    this.promisesUpdated(this.get('promiseAssembler').find());
  },

  updatedPromises: computed(function() { return A(); }),

  promisesUpdated(uniquePromises) {
    if (!uniquePromises) {
      uniquePromises = A();
      this.get('updatedPromises').forEach(promise => {
        uniquePromises.addObject(promise);
      });
    }
    // Remove inspector-created promises
    uniquePromises = uniquePromises.filter(promise => promise.get('label') !== 'ember-inspector');
    const serialized = this.serializeArray(uniquePromises);
    this.sendMessage('promisesUpdated', {
      promises: serialized
    });
    this.get('updatedPromises').clear();
  },

  promiseUpdated(event) {
    this.get('updatedPromises').pushObject(event.promise);
    Ember.run.debounce(this, 'promisesUpdated', this.delay);
  },

  promiseChained(event) {
    this.get('updatedPromises').pushObject(event.promise);
    this.get('updatedPromises').pushObject(event.child);
    run.debounce(this, 'promisesUpdated', this.delay);
  },

  serializeArray(promises) {
    return promises.map(item => this.serialize(item));
  },

  serialize(promise) {
    let serialized = {};
    serialized.guid = promise.get('guid');
    serialized.state = promise.get('state');
    serialized.label = promise.get('label');
    if (promise.get('children')) {
      serialized.children = this.promiseIds(promise.get('children'));
    }
    serialized.parent = promise.get('parent.guid');
    serialized.value = this.inspectValue(promise, 'value');
    serialized.reason = this.inspectValue(promise, 'reason');
    if (promise.get('createdAt')) {
      serialized.createdAt = promise.get('createdAt').getTime();
    }
    if (promise.get('settledAt')) {
      serialized.settledAt = promise.get('settledAt').getTime();
    }
    serialized.hasStack = !!promise.get('stack');
    return serialized;
  },

  promiseIds(promises) {
    return promises.map(promise => promise.get('guid'));
  },

  /**
   * Inspect the promise and pass to object inspector
   * @param {Promise} promise The promise object
   * @param {string} key The key for the property on the promise
   * @return {*|{inspect: (string|*), type: string}|{computed: boolean, inspect: string, type: string}|{inspect: string, type: string}}
   */
  inspectValue(promise, key) {
    let objectInspector = this.get('objectInspector');
    let inspected = objectInspector.inspectValue(promise, key);

    if (inspected.type === 'type-ember-object' || inspected.type === "type-array") {
      inspected.objectId = objectInspector.retainObject(promise.get(key));
      this.get('releaseMethods').pushObject(function() {
        objectInspector.releaseObject(inspected.objectId);
      });
    }
    return inspected;
  }

});
