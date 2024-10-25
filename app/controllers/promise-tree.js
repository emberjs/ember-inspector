import { action } from '@ember/object';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { debounce, next, once } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

// eslint-disable-next-line ember/no-observers
import { observes } from '@ember-decorators/object';

export default class PromiseTreeController extends Controller {
  queryParams = ['filter'];

  @service adapter;
  @service port;

  @tracked createdAfter = null;
  @tracked filter = 'all';
  @tracked searchValue = null;
  @tracked effectiveSearch = null;

  // below used to show the "refresh" message
  get isEmpty() {
    return this.model.length === 0;
  }
  get wasCleared() {
    return !this.createdAfter;
  }
  get neverCleared() {
    return !this.wasCleared;
  }
  get shouldRefresh() {
    return this.isEmpty && this.neverCleared;
  }

  // Keep track of promise stack traces.
  // It is opt-in due to performance reasons.
  @tracked instrumentWithStack = false;

  get filtered() {
    return this.model.filter((item) => {
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
    });
  }

  // eslint-disable-next-line ember/no-observers
  @observes('searchValue')
  searchChanged() {
    debounce(this, this.notifyChange, 500);
  }

  @action
  notifyChange() {
    this.effectiveSearch = this.searchValue;
    next(() => {
      this.notifyPropertyChange('model');
    });
  }

  @action
  toggleExpand(promise) {
    let isExpanded = !promise.get('isExpanded');
    promise.set('isManuallyExpanded', isExpanded);
    promise.recalculateExpanded();
    let children = promise._allChildren();
    if (isExpanded) {
      children.forEach((child) => {
        let isManuallyExpanded = child.get('isManuallyExpanded');
        if (isManuallyExpanded === undefined) {
          child.set('isManuallyExpanded', isExpanded);
          child.recalculateExpanded();
        }
      });
    }
  }

  @action
  tracePromise(promise) {
    this.port.send('promise:tracePromise', { promiseId: promise.get('guid') });
  }

  @action
  inspectObject() {
    this.target.send('inspectObject', ...arguments);
  }

  @action
  sendValueToConsole(promise) {
    this.port.send('promise:sendValueToConsole', {
      promiseId: promise.get('guid'),
    });
  }

  @action
  setFilter(filter) {
    this.filter = filter;
    next(() => {
      this.notifyPropertyChange('filtered');
    });
  }

  @action
  updateInstrumentWithStack(bool) {
    this.port.send('promise:setInstrumentWithStack', {
      instrumentWithStack: bool,
    });
  }

  @action
  clear() {
    this.createdAfter = new Date();
    once(this, this.notifyChange);
  }
}
