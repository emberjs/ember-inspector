import { assert } from '@ember/debug';
import { later } from '@ember/runloop';
import EmberObject, { action, setProperties } from '@ember/object';
import { addListener, removeListener, sendEvent } from '@ember/object/events';
import type { AnyFn } from 'ember/-private/type-utils';

import { TrackedArray, TrackedObject } from 'tracked-built-ins';
import { tracked } from '@glimmer/tracking';

import PromiseModel from '../models/promise';
import type PortService from '../services/port';

interface SerializedPromise {
  children?: Array<string>;
  guid: string;
  label: string;
  parent?: string;
  reason: string;
  state: string;
  value: string;
}

export default class PromiseAssembler extends EmberObject {
  declare port: PortService;
  // Used to track whether current message received
  // is the first in the request
  // Mainly helps in triggering 'firstMessageReceived' event
  @tracked firstMessageReceived = false;

  all = new TrackedArray<PromiseModel>([]);
  promiseIndex = new TrackedObject<Record<string, number>>({});
  topSort = new TrackedArray<PromiseModel>([]);
  topSortMeta = new TrackedObject<Record<string, { hasParent?: boolean }>>({});

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
    this.topSortMeta = new TrackedObject<
      Record<string, { hasParent?: boolean }>
    >({});
    this.promiseIndex = new TrackedObject<Record<string, number>>({});
    this.topSort.splice(0, this.topSort.length);

    this.firstMessageReceived = false;
    let all = this.all;
    // Lazily destroy promises
    // Allows for a smooth transition on deactivate,
    // and thus providing the illusion of better perf
    later(
      this,
      function () {
        this.destroyPromises(all);
      },
      500,
    );
    this.set('all', new TrackedArray([]));
  }

  destroyPromises(promises: Array<EmberObject>) {
    promises.forEach(function (item) {
      item.destroy();
    });
  }

  addOrUpdatePromises(message: { promises: Array<SerializedPromise> }) {
    this.rebuildPromises(message.promises);

    if (!this.firstMessageReceived) {
      this.firstMessageReceived = true;
      this.trigger('firstMessageReceived');
    }
  }

  rebuildPromises(promises: Array<SerializedPromise | PromiseModel>) {
    promises.forEach((props) => {
      props = Object.assign({}, props);
      let childrenIds = props.children;
      let parentId = props.parent;
      delete props.children;
      delete props.parent;
      if (parentId && parentId !== props.guid) {
        props.parent = this.updateOrCreate({ guid: parentId });
      }
      let promise = this.updateOrCreate(props);
      if (childrenIds) {
        childrenIds.forEach((childId) => {
          // avoid infinite recursion
          if (childId === props.guid) {
            return;
          }
          let child = this.updateOrCreate({ guid: childId, parent: promise });
          promise.children.push(child);
        });
      }
    });
  }

  updateTopSort(promise: PromiseModel) {
    let topSortMeta = this.topSortMeta;
    let guid = promise.guid;
    let meta = topSortMeta[guid] ?? {};
    let isNew = !meta;
    let hadParent: boolean | undefined = false;
    let hasParent = !!promise.parent;
    let topSort = this.topSort;
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
  }

  insertInTopSort(promise: PromiseModel) {
    let topSort = this.topSort;
    if (promise.parent) {
      let parentIndex = topSort.indexOf(promise.parent);
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
  }

  updateOrCreate(props: any) {
    let guid = props.guid;
    let promise = this.findOrCreate(guid);

    setProperties(promise, props);

    this.updateTopSort(promise);

    return promise;
  }

  createPromise(props: any): PromiseModel {
    let promise = PromiseModel.create(props);
    let index = this.all.length;

    this.all.push(promise);
    this.promiseIndex[promise.guid as keyof object] = index;
    return promise;
  }

  find(guid?: string) {
    if (guid) {
      let index = this.promiseIndex[guid as keyof object];
      if (index !== undefined) {
        return this.all.at(index);
      }
    } else {
      return this.all;
    }
  }

  findOrCreate(guid?: string) {
    if (!guid) {
      assert('You have tried to findOrCreate without a guid');
    }
    return (this.find(guid) as PromiseModel) || this.createPromise({ guid });
  }

  // Manually implement Evented functionality, so we can move away from the mixin

  on(eventName: string, method: AnyFn): void;
  on(eventName: string, target: unknown, method: AnyFn): void;

  @action
  on(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn): void {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod as AnyFn);
    } else {
      addListener(this, eventName, targetOrMethod, method!);
    }
  }

  one(eventName: string, method: AnyFn): void;
  one(eventName: string, target: unknown, method: AnyFn): void;

  @action
  one(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn) {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod as AnyFn, true);
    } else {
      addListener(this, eventName, targetOrMethod, method!, true);
    }
  }

  off(eventName: string, method: AnyFn): void;
  off(eventName: string, target: unknown, method: AnyFn): void;

  @action
  off(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn) {
    try {
      if (typeof targetOrMethod === 'function') {
        // If we did not pass a target, default to `this`
        removeListener(this, eventName, this, targetOrMethod as AnyFn);
      } else {
        removeListener(this, eventName, targetOrMethod, method!);
      }
    } catch (e) {
      console.error(e);
    }
  }

  @action
  trigger(eventName: string, ...args: Array<any>) {
    sendEvent(this, eventName, args);
  }
}
