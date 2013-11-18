var PromiseTreeController = Ember.ArrayController.extend({

  children: Ember.computed.filter('model.@each.pendingBranch', function(item) {
    if (!!item.get('parent')) { return false; } // this could be in separate filter but causing errors on re-render :/
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
    var search = this.get('effectiveSearch');
    if (!Ember.isEmpty(search)) {
      return item.matches(search);
    }
    return true;

  }),


  // filtered: Ember.computed.filterBy('model', 'parent', null),


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
    }
  }
});


export default PromiseTreeController;
