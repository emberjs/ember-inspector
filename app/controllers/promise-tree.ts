import { action } from '@ember/object';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { debounce, once } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

// @ts-expect-error We should move away from observers.
import { observes } from '@ember-decorators/object';

import type PortService from '../services/port';
import type PromiseModel from '../models/promise';
import type WebExtension from '../services/adapters/web-extension';
import { isNullish } from 'ember-inspector/utils/nullish';

export default class PromiseTreeController extends Controller {
  queryParams = ['filter'];

  declare model: Array<PromiseModel>;

  @service declare adapter: WebExtension;
  @service declare port: PortService;

  @tracked createdAfter: Date | null = null;
  @tracked effectiveSearch: string | null = null;
  @tracked filter = 'all';
  // Keep track of promise stack traces.
  // It is opt-in due to performance reasons.
  @tracked instrumentWithStack = false;
  @tracked searchValue: string | null = null;

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

  // eslint-disable-next-line ember/no-observers, @typescript-eslint/no-unsafe-call
  @observes('searchValue')
  searchChanged() {
    // eslint-disable-next-line ember/no-runloop
    debounce(this, this.updateEffectiveSearch, 500);
  }

  updateEffectiveSearch = () => {
    this.effectiveSearch = this.searchValue;
  };

  @action
  toggleExpand(promise: PromiseModel) {
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
  tracePromise(promise: PromiseModel) {
    this.port.send('promise:tracePromise', { promiseId: promise.guid });
  }

  @action
  inspectObject() {
    // @ts-expect-error TODO: figure this out later
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, prefer-rest-params
    this.target.send('inspectObject', ...arguments);
  }

  @action
  sendValueToConsole(promise: PromiseModel) {
    this.port.send('promise:sendValueToConsole', {
      promiseId: promise.guid,
    });
  }

  @action
  setFilter(filter: string) {
    this.filter = filter;
  }

  @action
  updateInstrumentWithStack(instrumentWithStack: boolean) {
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
