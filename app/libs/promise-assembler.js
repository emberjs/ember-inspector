import { assert } from '@ember/debug';
import { later } from '@ember/runloop';
import EmberObject from '@ember/object';
import EventedMixin from '@ember/object/evented';
import Promise from 'ember-inspector/models/promise';

export default class PromiseAssembler extends EmberObject.extend(EventedMixin) {
  // Used to track whether current message received
  // is the first in the request
  // Mainly helps in triggering 'firstMessageReceived' event
  firstMessageReceived = false;

  init() {
    super.init(...arguments);

    this.all = [];
    this.topSort = [];
    this.topSortMeta = {};
    this.promiseIndex = {};
  }

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
    this.set('topSortMeta', {});
    this.set('promiseIndex', {});
    this.topSort.clear();

    this.set('firstMessageReceived', false);
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
    this.set('all', []);
  }

  destroyPromises(promises) {
    promises.forEach(function (item) {
      item.destroy();
    });
  }

  addOrUpdatePromises(message) {
    this.rebuildPromises(message.promises);

    if (!this.firstMessageReceived) {
      this.set('firstMessageReceived', true);
      this.trigger('firstMessageReceived');
    }
  }

  rebuildPromises(promises) {
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
          promise.get('children').pushObject(child);
        });
      }
    });
  }

  updateTopSort(promise) {
    let topSortMeta = this.topSortMeta;
    let guid = promise.get('guid');
    let meta = topSortMeta[guid];
    let isNew = !meta;
    let hadParent = false;
    let hasParent = !!promise.get('parent');
    let topSort = this.topSort;
    let parentChanged = isNew;

    if (isNew) {
      meta = topSortMeta[guid] = {};
    } else {
      hadParent = meta.hasParent;
    }
    if (!isNew && hasParent !== hadParent) {
      // todo: implement recursion to reposition children
      topSort.removeObject(promise);
      parentChanged = true;
    }
    meta.hasParent = hasParent;
    if (parentChanged) {
      this.insertInTopSort(promise);
    }
  }

  insertInTopSort(promise) {
    let topSort = this.topSort;
    if (promise.get('parent')) {
      let parentIndex = topSort.indexOf(promise.get('parent'));
      topSort.insertAt(parentIndex + 1, promise);
    } else {
      topSort.pushObject(promise);
    }
    promise.get('children').forEach((child) => {
      topSort.removeObject(child);
      this.insertInTopSort(child);
    });
  }

  updateOrCreate(props) {
    let guid = props.guid;
    let promise = this.findOrCreate(guid);

    promise.setProperties(props);

    this.updateTopSort(promise);

    return promise;
  }

  createPromise(props) {
    let promise = Promise.create(props);
    let index = this.get('all.length');

    this.all.pushObject(promise);
    this.promiseIndex[promise.get('guid')] = index;
    return promise;
  }

  find(guid) {
    if (guid) {
      let index = this.promiseIndex[guid];
      if (index !== undefined) {
        return this.all.objectAt(index);
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
}
