import Ember from "ember";
const { computed, observer, inject } = Ember;
const { equal, bool, and, not } = computed;

export default Ember.Controller.extend({
  application: inject.controller(),

  queryParams: ['filter'],

  createdAfter: null,

  // below used to show the "refresh" message
  isEmpty: equal('model.length', 0),
  wasCleared: bool('createdAfter'),
  neverCleared: not('wasCleared'),
  shouldRefresh: and('isEmpty', 'neverCleared'),

  // Keep track of promise stack traces.
  // It is opt-in due to performance reasons.
  instrumentWithStack: false,

  init() {
    this._super(...arguments);
    // List-view does not support item controllers
    this.reopen({
      items: computed('filtered.[]', function() {
        let promiseItemController = this.get('promiseItemController');
        return this.get('filtered').map((item) => {
          return promiseItemController.create({ content: item });
        });
      })
    });
  },

  promiseItemController: computed(function() {
    return this.container.lookupFactory('controller:promise-item');
  }),

  /* jscs:disable validateIndentation */
  // TODO: This filter can be further optimized
  filtered: computed.filter(
    'model.@each.{createdAt,fulfilledBranch,rejectedBranch,pendingBranch,isVisible}', function(item) {
      // exclude cleared promises
      if (this.get('createdAfter') && item.get('createdAt') < this.get('createdAfter')) {
        return false;
      }

      if (!item.get('isVisible')) {
        return false;
      }

      // Exclude non-filter complying promises
      // If at least one of their children passes the filter,
      // then they pass
      let include = true;
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
      let search = this.get('effectiveSearch');
      if (!Ember.isEmpty(search)) {
        return item.matches(search);
      }
      return true;

    }
  ),
  /* jscs:enable validateIndentation */


  filter: 'all',

  noFilter: equal('filter', 'all'),
  isRejectedFilter: equal('filter', 'rejected'),
  isPendingFilter: equal('filter', 'pending'),
  isFulfilledFilter: equal('filter', 'fulfilled'),

  search: null,
  effectiveSearch: null,

  searchChanged: observer('search', function() {
    Ember.run.debounce(this, this.notifyChange, 500);
  }),

  notifyChange() {
    let self = this;
    this.set('effectiveSearch', this.get('search'));
    Ember.run.next(function() {
      self.notifyPropertyChange('model');
    });
  },

  actions: {
    setFilter(filter) {
      let self = this;
      this.set('filter', filter);
      Ember.run.next(function() {
        self.notifyPropertyChange('filtered');
      });
    },
    clear() {
      this.set('createdAfter', new Date());
      Ember.run.once(this, this.notifyChange);
    },
    tracePromise(promise) {
      this.get('port').send('promise:tracePromise', { promiseId: promise.get('guid') });
    },
    updateInstrumentWithStack: function(bool) {
      this.port.send('promise:setInstrumentWithStack', { instrumentWithStack: bool });
    }
  }
});
