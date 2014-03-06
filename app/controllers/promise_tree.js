function filterComputed() {
  var dependentKeys, callback;

  if (arguments.length > 1) {
    var slice = [].slice;
    dependentKeys = slice.call(arguments, 0, -1);
    callback = slice.call(arguments, -1)[0];
  }
  var options = {
    initialize: function (array, changeMeta, instanceMeta) {
      instanceMeta.filteredArrayIndexes = new Ember.SubArray();
    },

    addedItem: function(array, item, changeMeta, instanceMeta) {
      var match = !!callback.call(this, item),
          filterIndex = instanceMeta.filteredArrayIndexes.addItem(changeMeta.index, match);

      if (match) {
        array.insertAt(filterIndex, item);
      }

      return array;
    },

    removedItem: function(array, item, changeMeta, instanceMeta) {
      var filterIndex = instanceMeta.filteredArrayIndexes.removeItem(changeMeta.index);

      if (filterIndex > -1) {
        array.removeAt(filterIndex);
      }

      return array;
    }
  };
  var args = dependentKeys;
  args.push(options);

  /*jshint validthis:true */
  return Ember.arrayComputed.apply(this, args);
}

// Manual implementation of item controllers
function itemProxyComputed(dependentKey, itemProxy) {
  var options = {
    addedItem: function(array, item, changeMeta, instanceMeta) {
      var proxy = itemProxy.create({ content: item });
      array.insertAt(changeMeta.index, proxy);
      return array;
    },
    removedItem: function(array, item, changeMeta, instanceMeta) {
      var proxy = array.objectAt(changeMeta.index);
      array.removeAt(changeMeta.index, 1);
      proxy.destroy();
      return array;
    }
  };

  return Ember.arrayComputed(dependentKey, options);
}

var equal = Ember.computed.equal;
var bool = Ember.computed.bool;
var and = Ember.computed.and;
var not = Ember.computed.not;

export default Ember.ArrayController.extend({
  needs: ['application'],

  createdAfter: null,

  // below used to show the "refresh" message
  isEmpty: equal('model.length', 0),
  wasCleared: bool('createdAfter'),
  neverCleared: not('wasCleared'),
  shouldRefresh: and('isEmpty', 'neverCleared'),

  init: function() {
    // List-view does not support item controllers
    this.reopen({
      items: itemProxyComputed('filtered', this.get('promiseItemController'))
    });
  },

  promiseItemController: function() {
    return this.container.lookupFactory('controller:promise-item');
  }.property(),

  // TODO: This filter can be further optimized
  filtered: filterComputed(
      'model.@each.createdAt',
      'model.@each.fulfilledBranch',
      'model.@each.rejectedBranch',
      'model.@each.pendingBranch', function(item) {

    // exclude cleared promises
    if (this.get('createdAfter') && item.get('createdAt') < this.get('createdAfter')) {
      return false;
    }

    // Exclude non-filter complying promises
    // If at least one of their children passes the filter,
    // then they pass
    var include = true;
    if (this.get('filter') === 'pending') {
      include = item.get('pendingBranch');
    } else if (this.get('filter') === 'rejected') {
      include = item.get('rejectedBranch');
    } else if (this.get('filter') === 'fulfilled') {
      include = item.get('fulfilledBranch');
    }
    if (!include) {
      return false;
    }

    // Search filter
    // If they or at least one of their children
    // match the search, then include them
    var search = this.get('effectiveSearch');
    if (!Ember.isEmpty(search)) {
      return item.matches(search);
    }
    return true;

  }),

  filter: 'all',

  noFilter: equal('filter', 'all'),
  isRejectedFilter: equal('filter', 'rejected'),
  isPendingFilter: equal('filter', 'pending'),
  isFulfilledFilter: equal('filter', 'fulfilled'),

  search: null,
  effectiveSearch: null,

  searchChanged: function() {
    Ember.run.debounce(this, this.notifyChange, 500);
  }.observes('search'),

  notifyChange: function() {
    var self = this;
    this.set('effectiveSearch', this.get('search'));
    Ember.run.next(function() {
      self.notifyPropertyChange('filtered');
    });
  },

  actions: {
    setFilter: function(filter) {
      var self = this;
      this.set('filter', filter);
      Ember.run.next(function() {
        self.notifyPropertyChange('filtered');
      });
    },
    clear: function() {
      this.set('createdAfter', new Date());
      Ember.run.once(this, this.notifyChange);
    },
    tracePromise: function(promise) {
      this.get('port').send('promise:tracePromise', { promiseId: promise.get('guid') });
    }
  }
});
