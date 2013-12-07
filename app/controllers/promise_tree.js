var filterComputed = function() {
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
  return Ember.arrayComputed.apply(this, args);
};

var PromiseTreeController = Ember.ArrayController.extend({

  createdAfter: null,

  // TODO: This filter can be futher optimized
  children: filterComputed(
      'model.@each.createdAt',
      'model.@each.parent',
      'model.@each.fulfilledBranch',
      'model.@each.rejectedBranch',
      'model.@each.pendingBranch', function(item) {

   // only top level promises are allowed:/
    if (!!item.get('parent')) { return false; }

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

  noFilter: Ember.computed.equal('filter', 'all'),
  isRejectedFilter: Ember.computed.equal('filter', 'rejected'),
  isPendingFilter: Ember.computed.equal('filter', 'pending'),
  isFulfilledFilter: Ember.computed.equal('filter', 'fulfilled'),

  search: null,
  effectiveSearch: null,

  searchChanged: function() {
    Ember.run.debounce(this, this.notifyChange, 500);
  }.observes('search'),

  notifyChange: function() {
    var self = this;
    this.set('effectiveSearch', this.get('search'));
    Ember.run.next(function() {
      self.notifyPropertyChange('children');
    });
  },

  actions: {
    setFilter: function(filter) {
      var self = this;
      this.set('filter', filter);
      Ember.run.next(function() {
        self.notifyPropertyChange('children');
      });
    },
    clear: function() {
      this.set('createdAfter', new Date());
      Ember.run.once(this, this.notifyChange);
    }
  }
});


export default PromiseTreeController;
