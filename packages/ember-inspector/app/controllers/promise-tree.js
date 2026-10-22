import { action } from '@ember/object';
import Controller from '@ember/controller';
import { service } from '@ember/service';
import { debounce, once } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

import { observes } from '@ember-decorators/object';

import { isNullish } from 'ember-inspector/utils/nullish';

export default class PromiseTreeController extends Controller {
  queryParams = ['filter'];

  @service adapter;
  @service port;

  @tracked createdAfter = null;
  @tracked effectiveSearch = null;
  @tracked filter = 'all';
  // Keep track of promise stack traces.
  // It is opt-in due to performance reasons.
  @tracked instrumentWithStack = false;
  @tracked searchValue = null;

  // below used to show the "refresh" message
  get isEmpty() {
    return this.model.length === 0;
  }

  get neverCleared() {
    return !this.wasCleared;
  }

  get shouldRefresh() {
    return this.isEmpty && this.neverCleared;
  }

  get wasCleared() {
    return Boolean(this.createdAfter);
  }

  get filtered() {
    return this.model.filter((item) => {
      // exclude cleared promises
      if (this.createdAfter && item.createdAt < this.createdAfter) {
        return false;
      }

      if (!item.isVisible) {
        return false;
      }

      // Exclude non-filter complying promises
      // If at least one of their children passes the filter,
      // then they pass
      let include = true;
      if (this.filter === 'pending') {
        include = item.pendingBranch;
      } else if (this.filter === 'rejected') {
        include = item.rejectedBranch;
      } else if (this.filter === 'fulfilled') {
        include = item.fulfilledBranch;
      }
      if (!include) {
        return false;
      }

      // Search filter
      // If they or at least one of their children
      // match the search, then include them
      const search = this.effectiveSearch;
      if (!isNullish(search)) {
        return item.matches(search);
      }
      return true;
    });
  }

  // eslint-disable-next-line ember/no-observers
  @observes('searchValue')
  searchChanged() {
    // eslint-disable-next-line ember/no-runloop
    debounce(this, this.updateEffectiveSearch, 500);
  }

  updateEffectiveSearch = () => {
    this.effectiveSearch = this.searchValue;
  };

  @action
  toggleExpand(promise) {
    const isExpanded = !promise.isExpanded;
    promise.isManuallyExpanded = isExpanded;
    promise.recalculateExpanded();
    const children = promise._allChildren();
    if (isExpanded) {
      children.forEach((child) => {
        if (isNullish(child.isManuallyExpanded)) {
          child.isManuallyExpanded = isExpanded;
          child.recalculateExpanded();
        }
      });
    }
  }

  @action
  tracePromise(promise) {
    this.port.send('promise:tracePromise', { promiseId: promise.guid });
  }

  @action
  inspectObject() {
    this.target.send('inspectObject', ...arguments);
  }

  @action
  sendValueToConsole(promise) {
    this.port.send('promise:sendValueToConsole', {
      promiseId: promise.guid,
    });
  }

  @action
  setFilter(filter) {
    this.filter = filter;
  }

  @action
  updateInstrumentWithStack(instrumentWithStack) {
    this.port.send('promise:setInstrumentWithStack', {
      instrumentWithStack,
    });
  }

  @action
  clear() {
    this.createdAfter = new Date();
    // eslint-disable-next-line ember/no-runloop
    once(this, this.updateEffectiveSearch);
  }
}
