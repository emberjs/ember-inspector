import Promise from "models/promise";

var arrayComputed = Ember.computed(function(){
  return [];
});

var objectComputed = Ember.computed(function(){
  return [];
});

export default Ember.Object.extend({
  all: arrayComputed,
  topSort: arrayComputed,
  topSortMeta: objectComputed,
  promiseIndex: objectComputed,

  start: function() {
    this.get('port').on('promise:promisesUpdated', this, this.addOrUpdatePromises);
    this.get('port').send('promise:getAndObservePromises');
  },

  stop: function() {
    this.get('port').off('promise:promisesUpdated', this, this.addOrUpdatePromises);
    this.get('port').send('promise:releasePromises');
    this.reset();
  },

  reset: function() {
    this.set('topSortMeta', {});
    this.set('promiseIndex', {});
    this.get('topSort').clear();
    var all = this.get('all');
    // Lazily destroy promises
    // Allows for a smooth transition on deactivate,
    // and thus providing the illusion of better perf
    Ember.run.later(this, function() {
     this.destroyPromises(all);
    }, 500);
    this.set('all', []);
  },

  destroyPromises: function(promises) {
    promises.forEach(function(item) {
      item.destroy();
    });
  },

  addOrUpdatePromises: function(message) {
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
    var topSortMeta = this.get('topSortMeta'),
        guid = promise.get('guid'),
        meta = topSortMeta[guid],
        isNew = !meta,
        hadParent = false,
        hasParent = !!promise.get('parent'),
        topSort = this.get('topSort'),
        parentChanged = isNew;

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
    if (!guid) {
      Ember.assert('You have tried to findOrCreate without a guid');
    }
    return this.find(guid) || this.createPromise({
      guid: guid
    });
  }
});
