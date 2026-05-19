import { assert } from '@ember/debug';
import { later } from '@ember/runloop';
import EmberObject, { action, setProperties } from '@ember/object';
import { addListener, removeListener, sendEvent } from '@ember/object/events';

import { TrackedArray, TrackedObject } from 'tracked-built-ins';
import { tracked } from '@glimmer/tracking';

import PromiseModel from '../models/promise';

export default class PromiseAssembler extends EmberObject {
  // Used to track whether current message received
  // is the first in the request
  // Mainly helps in triggering 'firstMessageReceived' event
  @tracked firstMessageReceived = false;

  all = new TrackedArray([]);
  promiseIndex = new TrackedObject({});
  topSort = new TrackedArray([]);
  topSortMeta = new TrackedObject({});

  start() {
    this.port.on('promise:promisesUpdated', this, this.addOrUpdatePromises);
    this.port.send('promise:getAndObservePromises');
  }

  stop() {
    this.port.off('promise:promisesUpdated', this, this.addOrUpdatePromises);
    this.port.send('promise:releasePromises');
    this.reset();
  }

  reset() {
    this.topSortMeta = new TrackedObject({});
    this.promiseIndex = new TrackedObject({});
    this.topSort.splice(0, this.topSort.length);

    this.firstMessageReceived = false;
    const all = this.all;
    // Lazily destroy promises
    // Allows for a smooth transition on deactivate,
    // and thus providing the illusion of better perf
    // eslint-disable-next-line ember/no-runloop
    later(
      this,
      function () {
        this.destroyPromises(all);
      },
      500,
    );
    this.all = new TrackedArray([]);
  }

  destroyPromises(promises) {
    promises.forEach(function (item) {
      item.destroy();
    });
  }

  addOrUpdatePromises = (message) => {
    this.rebuildPromises(message.promises);

    if (!this.firstMessageReceived) {
      this.firstMessageReceived = true;
      this.trigger('firstMessageReceived');
    }
  };

  rebuildPromises = (promises) => {
    promises.forEach((props) => {
      props = Object.assign({}, props);
      const childrenIds = props.children;
      const parentId = props.parent;
      delete props.children;
      delete props.parent;
      if (parentId && parentId !== props.guid) {
        props.parent = this.updateOrCreate({ guid: parentId });
      }
      const promise = this.updateOrCreate(props);
      if (childrenIds) {
        childrenIds.forEach((childId) => {
          // avoid infinite recursion
          if (childId === props.guid) {
            return;
          }
          const child = this.updateOrCreate({ guid: childId, parent: promise });
          promise.children.push(child);
        });
      }
    });
  };

  updateTopSort = (promise) => {
    const topSortMeta = this.topSortMeta;
    const guid = promise.guid;
    let meta = topSortMeta[guid] ?? {};
    const isNew = !meta;
    let hadParent = false;
    const hasParent = !!promise.parent;
    const topSort = this.topSort;
    let parentChanged = isNew;

    if (isNew) {
      meta = topSortMeta[guid] = {};
    } else {
      hadParent = meta.hasParent;
    }
    if (!isNew && hasParent !== hadParent) {
      // todo: implement recursion to reposition children
      const index = topSort.indexOf(promise);
      if (index !== -1) {
        topSort.splice(index, 1);
      }
      parentChanged = true;
    }
    meta.hasParent = hasParent;
    if (parentChanged) {
      this.insertInTopSort(promise);
    }
  };

  insertInTopSort = (promise) => {
    const topSort = this.topSort;
    if (promise.parent) {
      const parentIndex = topSort.indexOf(promise.parent);
      topSort.splice(parentIndex + 1, 0, promise);
    } else {
      this.topSort.push(promise);
    }
    promise.children.forEach((child) => {
      const index = topSort.indexOf(child);
      if (index !== -1) {
        topSort.splice(index, 1);
      }
      this.insertInTopSort(child);
    });
  };

  updateOrCreate = (props) => {
    const guid = props.guid;
    const promise = this.findOrCreate(guid);

    setProperties(promise, props);

    this.updateTopSort(promise);

    return promise;
  };

  createPromise(props) {
    const promise = PromiseModel.create(props);
    const index = this.all.length;

    this.all.push(promise);
    this.promiseIndex[promise.guid] = index;
    return promise;
  }

  find(guid) {
    if (guid) {
      const index = this.promiseIndex[guid];
      if (index !== undefined) {
        return this.all.at(index);
      }
    } else {
      return this.all;
    }
  }

  findOrCreate(guid) {
    if (!guid) {
      assert('You have tried to findOrCreate without a guid');
    }
    return this.find(guid) || this.createPromise({ guid });
  }

  // Manually implement Evented functionality, so we can move away from the mixin

  @action
  on(eventName, targetOrMethod, method) {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod);
    } else {
      addListener(this, eventName, targetOrMethod, method);
    }
  }

  @action
  one(eventName, targetOrMethod, method) {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod, true);
    } else {
      addListener(this, eventName, targetOrMethod, method, true);
    }
  }

  @action
  off(eventName, targetOrMethod, method) {
    try {
      if (typeof targetOrMethod === 'function') {
        // If we did not pass a target, default to `this`
        removeListener(this, eventName, this, targetOrMethod);
      } else {
        removeListener(this, eventName, targetOrMethod, method);
      }
    } catch (e) {
      console.error(e);
    }
  }

  @action
  trigger(eventName, ...args) {
    sendEvent(this, eventName, args);
  }
}
