/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { assert } from '@ember/debug';
import { later } from '@ember/runloop';
import EmberObject, { action, setProperties } from '@ember/object';
import { addListener, removeListener, sendEvent } from '@ember/object/events';
import type { AnyFn } from '@ember/-internals/utility-types';

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

  destroyPromises(promises: Array<EmberObject>) {
    promises.forEach(function (item) {
      item.destroy();
    });
  }

  addOrUpdatePromises = (message: { promises: Array<SerializedPromise> }) => {
    this.rebuildPromises(message.promises);

    if (!this.firstMessageReceived) {
      this.firstMessageReceived = true;
      this.trigger('firstMessageReceived');
    }
  };

  rebuildPromises = (promises: Array<SerializedPromise | PromiseModel>) => {
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

  updateTopSort = (promise: PromiseModel) => {
    const topSortMeta = this.topSortMeta;
    const guid = promise.guid;
    let meta = topSortMeta[guid] ?? {};
    const isNew = !meta;
    let hadParent: boolean | undefined = false;
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

  insertInTopSort = (promise: PromiseModel) => {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateOrCreate = (props: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const guid = props.guid;
    const promise = this.findOrCreate(guid);

    setProperties(promise, props);

    this.updateTopSort(promise);

    return promise;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createPromise(props: any): PromiseModel {
    const promise = PromiseModel.create(props) as PromiseModel;
    const index = this.all.length;

    this.all.push(promise);
    this.promiseIndex[promise.guid as keyof object] = index;
    return promise;
  }

  find(guid?: string) {
    if (guid) {
      const index = this.promiseIndex[guid as keyof object];
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
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  on(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn): void {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod as AnyFn);
    } else {
      addListener(this, eventName, targetOrMethod as object, method);
    }
  }

  one(eventName: string, method: AnyFn): void;
  one(eventName: string, target: unknown, method: AnyFn): void;

  @action
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  one(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn) {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod as AnyFn, true);
    } else {
      addListener(this, eventName, targetOrMethod as object, method, true);
    }
  }

  off(eventName: string, method: AnyFn): void;
  off(eventName: string, target: unknown, method: AnyFn): void;

  @action
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  off(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn) {
    try {
      if (typeof targetOrMethod === 'function') {
        // If we did not pass a target, default to `this`
        removeListener(this, eventName, this, targetOrMethod as AnyFn);
      } else {
        removeListener(this, eventName, targetOrMethod as object, method);
      }
    } catch (e) {
      console.error(e);
    }
  }

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trigger(eventName: string, ...args: Array<any>) {
    sendEvent(this, eventName, args);
  }
}
