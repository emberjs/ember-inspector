import DebugPort from './debug-port';
import PromiseAssembler from 'ember-debug/libs/promise-assembler';

import { A } from 'ember-debug/utils/ember/array';
import { computed } from 'ember-debug/utils/ember/object';
import { readOnly } from 'ember-debug/utils/ember/object/computed';
import { debounce } from 'ember-debug/utils/ember/runloop';
import RSVP from 'ember-debug/utils/rsvp';

export default DebugPort.extend({
  namespace: null,
  objectInspector: readOnly('namespace.objectInspector'),
  adapter: readOnly('namespace.adapter'),
  portNamespace: 'promise',
  session: readOnly('namespace.session'),

  // created on init
  promiseAssembler: null,
  updatedPromises: null,
  releaseMethods: null,

  init() {
    this._super();
    this.promiseAssembler = PromiseAssembler.create();
    this.updatedPromises = A();
    this.releaseMethods = A();
    this.setInstrumentWithStack();
    this.sendInstrumentWithStack();
    this.promiseAssembler.start();
  },

  delay: 100,

  willDestroy() {
    this.releaseAll();
    if (this.promiseAssembler) {
      this.promiseAssembler.destroy();
    }
    this.promiseAssembler = null;
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
      let promise = this.promiseAssembler.find(promiseId);
      let value = promise.get('value');
      if (value === undefined) {
        value = promise.get('reason');
      }
      this.objectInspector.sendValueToConsole(value);
    },

    tracePromise(message) {
      let id = message.promiseId;
      let promise = this.promiseAssembler.find(id);
      // Remove first two lines and add label
      let stack = promise.get('stack');
      if (stack) {
        stack = stack.split('\n');
        stack.splice(0, 2, [
          `Ember Inspector (Promise Trace): ${promise.get('label') || ''}`,
        ]);
        this.adapter.log(stack.join('\n'));
      }
    },

    setInstrumentWithStack(message) {
      let bool = message.instrumentWithStack;
      this.set('instrumentWithStack', bool);
      this.setInstrumentWithStack();
    },

    getInstrumentWithStack() {
      this.sendInstrumentWithStack();
    },
  },

  instrumentWithStack: computed('session', {
    get() {
      return !!this.session.getItem('promise:stack');
    },
    set(key, value) {
      this.session.setItem('promise:stack', value);
      return value;
    },
  }),

  sendInstrumentWithStack() {
    this.sendMessage('instrumentWithStack', {
      instrumentWithStack: this.instrumentWithStack,
    });
  },

  setInstrumentWithStack() {
    RSVP.configure('instrument-with-stack', this.instrumentWithStack);
    this.sendInstrumentWithStack();
  },

  releaseAll() {
    this.releaseMethods.forEach((fn) => {
      fn();
    });
    this.releaseMethods.clear();
  },

  getAndObservePromises() {
    this.promiseAssembler.on('created', this, this.promiseUpdated);
    this.promiseAssembler.on('fulfilled', this, this.promiseUpdated);
    this.promiseAssembler.on('rejected', this, this.promiseUpdated);
    this.promiseAssembler.on('chained', this, this.promiseChained);

    this.releaseMethods.pushObject(() => {
      this.promiseAssembler.off('created', this, this.promiseUpdated);
      this.promiseAssembler.off('fulfilled', this, this.promiseUpdated);
      this.promiseAssembler.off('rejected', this, this.promiseUpdated);
      this.promiseAssembler.off('chained', this, this.promiseChained);
    });

    this.promisesUpdated(this.promiseAssembler.find());
  },

  promisesUpdated(uniquePromises) {
    if (!uniquePromises) {
      uniquePromises = A();
      this.updatedPromises.forEach((promise) => {
        uniquePromises.addObject(promise);
      });
    }
    // Remove inspector-created promises
    uniquePromises = uniquePromises.filter(
      (promise) => promise.get('label') !== 'ember-inspector'
    );
    const serialized = this.serializeArray(uniquePromises);
    this.sendMessage('promisesUpdated', {
      promises: serialized,
    });
    this.updatedPromises.clear();
  },

  promiseUpdated(event) {
    this.updatedPromises.pushObject(event.promise);
    debounce(this, 'promisesUpdated', this.delay);
  },

  promiseChained(event) {
    this.updatedPromises.pushObject(event.promise);
    this.updatedPromises.pushObject(event.child);
    debounce(this, 'promisesUpdated', this.delay);
  },

  serializeArray(promises) {
    return promises.map((item) => this.serialize(item));
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
    return promises.map((promise) => promise.get('guid'));
  },

  /**
   * Inspect the promise and pass to object inspector
   * @param {Promise} promise The promise object
   * @param {string} key The key for the property on the promise
   * @return {*|{inspect: (string|*), type: string}|{computed: boolean, inspect: string, type: string}|{inspect: string, type: string}}
   */
  inspectValue(promise, key) {
    let objectInspector = this.objectInspector;
    let inspected = objectInspector.inspectValue(promise, key);

    if (
      inspected.type === 'type-ember-object' ||
      inspected.type === 'type-array'
    ) {
      console.count('inspectValue');

      inspected.objectId = objectInspector.retainObject(promise.get(key));
      this.releaseMethods.pushObject(function () {
        objectInspector.releaseObject(inspected.objectId);
      });
    }
    return inspected;
  },
});
