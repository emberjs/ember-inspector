/**
 Original implementation and the idea behind the `PromiseAssembler`,
 `Promise` model, and other work related to promise inspection was done
 by Stefan Penner (@stefanpenner) thanks to McGraw Hill Education (@mhelabs)
 and Yapp Labs (@yapplabs).
 */

import Promise from 'ember-debug/models/promise';

import { A } from '../utils/ember/array';
import EmberObject from '../utils/ember/object';
import Evented from '../utils/ember/object/evented';
import { isNone } from '../utils/ember/utils';
import RSVP from '../utils/rsvp';

let PromiseAssembler = EmberObject.extend(Evented, {
  // RSVP lib to debug
  RSVP,

  isStarted: false,

  init() {
    this._super(...arguments);
    this.all = A();
    this.promiseIndex = {};
  },

  start() {
    this.RSVP.configure('instrument', true);

    this.promiseChained = (e) => {
      chain.call(this, e);
    };
    this.promiseRejected = (e) => {
      reject.call(this, e);
    };
    this.promiseFulfilled = (e) => {
      fulfill.call(this, e);
    };
    this.promiseCreated = (e) => {
      create.bind(this)(e);
    };

    this.RSVP.on('chained', this.promiseChained);
    this.RSVP.on('rejected', this.promiseRejected);
    this.RSVP.on('fulfilled', this.promiseFulfilled);
    this.RSVP.on('created', this.promiseCreated);

    this.isStarted = true;
  },

  stop() {
    if (this.isStarted) {
      this.RSVP.configure('instrument', false);
      this.RSVP.off('chained', this.promiseChained);
      this.RSVP.off('rejected', this.promiseRejected);
      this.RSVP.off('fulfilled', this.promiseFulfilled);
      this.RSVP.off('created', this.promiseCreated);

      this.all.forEach((item) => {
        item.destroy();
      });

      this.all = A();
      this.promiseIndex = {};
      this.promiseChained = null;
      this.promiseRejected = null;
      this.promiseFulfilled = null;
      this.promiseCreated = null;
      this.isStarted = false;
    }
  },

  willDestroy() {
    this.stop();
    this._super();
  },

  createPromise(props) {
    let promise = Promise.create(props);
    let index = this.get('all.length');

    this.all.pushObject(promise);
    this.promiseIndex[promise.get('guid')] = index;
    return promise;
  },

  find(guid) {
    if (guid) {
      const index = this.promiseIndex[guid];
      if (index !== undefined) {
        return this.all.objectAt(index);
      }
    } else {
      return this.all;
    }
  },

  findOrCreate(guid) {
    return this.find(guid) || this.createPromise({ guid });
  },

  updateOrCreate(guid, properties) {
    let entry = this.find(guid);
    if (entry) {
      entry.setProperties(properties);
    } else {
      properties = Object.assign({}, properties);
      properties.guid = guid;
      entry = this.createPromise(properties);
    }

    return entry;
  },
});

export default PromiseAssembler;

function fulfill(event) {
  const guid = event.guid;
  const promise = this.updateOrCreate(guid, {
    label: event.label,
    settledAt: event.timeStamp,
    state: 'fulfilled',
    value: event.detail,
  });
  this.trigger('fulfilled', { promise });
}

function reject(event) {
  const guid = event.guid;
  const promise = this.updateOrCreate(guid, {
    label: event.label,
    settledAt: event.timeStamp,
    state: 'rejected',
    reason: event.detail,
  });
  this.trigger('rejected', { promise });
}

function chain(event) {
  let guid = event.guid;
  let promise = this.updateOrCreate(guid, {
    label: event.label,
    chainedAt: event.timeStamp,
  });
  let children = promise.get('children');
  let child = this.findOrCreate(event.childGuid);

  child.set('parent', promise);
  children.pushObject(child);

  this.trigger('chained', { promise, child });
}

function create(event) {
  const guid = event.guid;

  const promise = this.updateOrCreate(guid, {
    label: event.label,
    createdAt: event.timeStamp,
    stack: event.stack,
  });

  // todo fix ordering
  if (isNone(promise.get('state'))) {
    promise.set('state', 'created');
  }
  this.trigger('created', { promise });
}
