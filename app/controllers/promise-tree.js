import { observer } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import { isEmpty } from '@ember/utils';
import { equal, bool, and, not, filter } from '@ember/object/computed';
import { debounce, next, once } from '@ember/runloop';

export default Controller.extend({
  application: controller(),

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

  /* jscs:disable validateIndentation */
  filtered: filter(
    'model.@each.{createdAt,fulfilledBranch,rejectedBranch,pendingBranch,isVisible}', function(item) {

      // exclude cleared promises
      if (this.createdAfter && item.get('createdAt') < this.createdAfter) {
        return false;
      }

      if (!item.get('isVisible')) {
        return false;
      }

      // Exclude non-filter complying promises
      // If at least one of their children passes the filter,
      // then they pass
      let include = true;
      if (this.filter === 'pending') {
        include = item.get('pendingBranch');
      } else if (this.filter === 'rejected') {
        include = item.get('rejectedBranch');
      } else if (this.filter === 'fulfilled') {
        include = item.get('fulfilledBranch');
      }
      if (!include) {
        return false;
      }

      // Search filter
      // If they or at least one of their children
      // match the search, then include them
      let search = this.effectiveSearch;
      if (!isEmpty(search)) {
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

  searchValue: null,
  effectiveSearch: null,

  searchChanged: observer('searchValue', function() {
    debounce(this, this.notifyChange, 500);
  }),

  notifyChange() {
    this.set('effectiveSearch', this.searchValue);
    next(() => {
      this.notifyPropertyChange('model');
    });
  },

  actions: {
    setFilter(filter) {
      this.set('filter', filter);
      next(() => {
        this.notifyPropertyChange('filtered');
      });
    },
    clear() {
      this.set('createdAfter', new Date());
      once(this, this.notifyChange);
    },
    tracePromise(promise) {
      this.port.send('promise:tracePromise', { promiseId: promise.get('guid') });
    },
    updateInstrumentWithStack(bool) {
      this.port.send('promise:setInstrumentWithStack', { instrumentWithStack: bool });
    },
    toggleExpand(promise) {
      let isExpanded = !promise.get('isExpanded');
      promise.set('isManuallyExpanded', isExpanded);
      promise.recalculateExpanded();
      let children = promise._allChildren();
      if (isExpanded) {
        children.forEach(child => {
          let isManuallyExpanded = child.get('isManuallyExpanded');
          if (isManuallyExpanded === undefined) {
            child.set('isManuallyExpanded', isExpanded);
            child.recalculateExpanded();
          }
        });
      }
    },
    inspectObject() {
      this.target.send('inspectObject', ...arguments);
    },
    sendValueToConsole(promise) {
      this.port.send('promise:sendValueToConsole', { promiseId: promise.get('guid') });
    }
  }
});
