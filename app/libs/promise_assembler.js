import Promise from "models/promise";

var PromiseAssembler = Ember.Object.extend({

  all: function() { return []; }.property(),

  promiseIndex: function() { return {}; }.property(),

  topSort: function() { return []; }.property(),

  topSortMeta: function() { return {}; },

  start: function() {
    this.get('port').on('promise:promisesAdded', this, this.addPromises);
    this.get('port').on('promise:promisesUpdated', this, this.updatePromises);
    this.get('port').send('promise:getAndObservePromises');
  },

  stop: function() {
    this.get('port').off('promise:promiseAdded', this, this.addPromises);
    this.get('port').off('promise:promiseUpdated', this, this.updatePromises);
    this.get('port').send('promise:releasePromises');
    this.reset();
  },

  reset: function() {
    this.set('topSortMeta', {});
    this.set('topSort', []);
    this.set('promiseIndex', {});
    this.set('all', []);
  },

  addPromises: function(message) {
    this.rebuildPromises(message.promises);
  },

  updatePromises: function(message) {
    this.rebuildPromises(message.promises);
  },

  rebuildPromises: function(promises) {
    promises.forEach(function(props) {
      props = Ember.copy(props);
      var childrenIds = props.children;
      var parentId = props.parent;
      delete props.children;
      delete props.parent;
      if (parentId) {
        props.parent = this.updateOrCreate({ guid: parentId });
      }
      var promise = this.updateOrCreate(props);
      if (childrenIds) {
        childrenIds.forEach(function(childId){
          var child = this.updateOrCreate({ guid: childId, parent: promise });
          promise.get('children').pushObject(child);
        }.bind(this));
      }
    }.bind(this));
  },

  updateTopSort: function(promise) {
    var topSortMeta = this.get('topSortMeta');
    var guid = promise.get('guid');
    var meta = topSortMeta[guid];
    var isNew = !meta;
    var hadParent = false;
    var hasParent = !!promise.get('parent');
    var topSort = this.get('topSort');
    var parentChanged = isNew;

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
  },

  insertInTopSort: function(promise) {
    var topSort = this.get('topSort');
    if (promise.get('parent')) {
      var parentIndex = topSort.indexOf(promise.get('parent'));
      topSort.insertAt(parentIndex + 1, promise);
    } else {
      topSort.pushObject(promise);
    }
    promise.get('children').forEach(function(child) {
      topSort.removeObject(child);
      this.insertInTopSort(child);
    }.bind(this));
  },

  updateOrCreate: function(props) {
    var guid = props.guid;
    var parentChanged = true;
    var promise = this.findOrCreate(guid);

    promise.setProperties(props);

    this.updateTopSort(promise);
    return promise;

  },

  createPromise: function(props) {
    var promise = Promise.create(props),
        index = this.get('all.length');

    this.get('all').pushObject(promise);
    this.get('promiseIndex')[promise.get('guid')] = index;
    return promise;
  },

  find: function(guid) {
    if (guid) {
      var index = this.get('promiseIndex')[guid];
      if (index !== undefined) {
        return this.get('all').objectAt(index);
      }
    } else {
      return this.get('all');
    }
  },


  findOrCreate: function(guid) {
    return this.find(guid) || this.createPromise({
      guid: guid
    });
  }



});

export default PromiseAssembler;
