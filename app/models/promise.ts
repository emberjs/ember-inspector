// @ts-expect-error This does not seem to be typed
import { observes } from '@ember-decorators/object';
import { once } from '@ember/runloop';
import { typeOf } from '@ember/utils';
// eslint-disable-next-line ember/no-observers
import EmberObject, { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { TrackedArray } from 'tracked-built-ins';

import escapeRegExp from '../utils/escape-reg-exp';
import { isNullish } from '../utils/nullish';

const dateComputed = function () {
  return computed({
    get() {
      return null;
    },
    set(_key, date: Date | number | string) {
      if (typeOf(date) === 'date') {
        return date;
      } else if (typeof date === 'number' || typeof date === 'string') {
        return new Date(date);
      }
      return null;
    },
  });
};

export default class PromiseModel extends EmberObject {
  children = new TrackedArray<PromiseModel>([]);
  declare label?: string;
  declare guid: string;
  declare state: string;
  // @ts-expect-error TODO: figure out types for this
  @dateComputed() createdAt;
  // @ts-expect-error TODO: figure out types for this
  @dateComputed() settledAt;

  @tracked branchLabel = '';
  @tracked isExpanded = false;
  @tracked isManuallyExpanded = undefined;
  @tracked parent: PromiseModel | null = null;

  get level(): number {
    let parent = this.parent;
    if (!parent) {
      return 0;
    }
    return parent.level + 1;
  }

  get isSettled() {
    return this.isFulfilled || this.isRejected;
  }

  get isFulfilled() {
    return this.state === 'fulfilled';
  }

  get isRejected() {
    return this.state === 'rejected';
  }

  get isPending() {
    return !this.isSettled;
  }

  get pendingBranch() {
    return this.recursiveState('isPending', 'pendingBranch');
  }

  get rejectedBranch() {
    return this.recursiveState('isRejected', 'rejectedBranch');
  }

  get fulfilledBranch() {
    return this.recursiveState('isFulfilled', 'fulfilledBranch');
  }

  recursiveState(prop: keyof PromiseModel, cp: keyof PromiseModel) {
    if (this[prop]) {
      return true;
    }
    for (let i = 0; i < this.children.length; i++) {
      if (this.children.at(i)?.[cp]) {
        return true;
      }
    }
    return false;
  }

  // Need this observer because CP dependent keys do not support nested arrays
  // TODO: This can be so much better
  // eslint-disable-next-line ember/no-observers
  @observes('pendingBranch', 'fulfilledBranch', 'rejectedBranch')
  stateChanged() {
    if (!this.parent) {
      return;
    }
    if (
      (this.pendingBranch && !this.parent.pendingBranch) ||
      (this.fulfilledBranch && !this.parent.fulfilledBranch) ||
      (this.rejectedBranch && !this.parent.rejectedBranch)
    ) {
      this.parent.notifyPropertyChange('fulfilledBranch');
      this.parent.notifyPropertyChange('rejectedBranch');
      this.parent.notifyPropertyChange('pendingBranch');
    }
  }

  // eslint-disable-next-line ember/no-observers
  @observes('label', 'parent')
  updateParentLabel() {
    this.addBranchLabel(this.label, true);
  }

  addBranchLabel(label?: string, replace?: boolean) {
    if (isNullish(label)) {
      return;
    }
    if (replace) {
      this.branchLabel = label;
    } else {
      this.branchLabel = `${this.branchLabel} ${label}`;
    }

    let parent = this.parent;
    if (parent) {
      parent.addBranchLabel(label);
    }
  }

  matches(val: string) {
    return !!this.branchLabel
      .toLowerCase()
      .match(new RegExp(`.*${escapeRegExp(val.toLowerCase())}.*`));
  }

  matchesExactly(val: string) {
    return !!(this.label || '')
      .toLowerCase()
      .match(new RegExp(`.*${escapeRegExp(val.toLowerCase())}.*`));
  }

  // EXPANDED / COLLAPSED PROMISES

  // eslint-disable-next-line ember/no-observers
  @observes('isPending', 'isFulfilled', 'isRejected', 'parent')
  stateOrParentChanged() {
    let parent = this.parent;
    if (parent) {
      once(parent, 'recalculateExpanded');
    }
  }

  _findTopParent(): PromiseModel {
    let parent = this.parent;
    if (!parent) {
      return this;
    } else {
      return parent._findTopParent();
    }
  }

  recalculateExpanded() {
    let isExpanded = false;
    if (this.isManuallyExpanded !== undefined) {
      isExpanded = this.isManuallyExpanded;
    } else {
      let children = this._allChildren();
      for (let i = 0; i < children.length; i++) {
        let child = children[i] as PromiseModel;
        if (child.isRejected) {
          isExpanded = true;
        }
        if (child.isPending && !child.parent!.isPending) {
          isExpanded = true;
        }
        if (isExpanded) {
          break;
        }
      }
      let parents = this._allParents();
      if (isExpanded) {
        parents.forEach((parent) => {
          parent.set('isExpanded', true);
        });
      } else if (this.parent?.isExpanded) {
        this.parent.recalculateExpanded();
      }
    }
    this.isExpanded = isExpanded;
    return isExpanded;
  }

  get isVisible(): boolean {
    if (this.parent) {
      return this.parent.isExpanded && this.parent.isVisible;
    }
    return true;
  }

  _allChildren() {
    let children = [...this.children];
    children.forEach((item) => {
      children = [...children, ...item._allChildren()];
    });
    return children;
  }

  _allParents(): Array<PromiseModel> {
    let parent = this.parent;
    if (parent) {
      return [parent, ...parent._allParents()];
    } else {
      return [];
    }
  }
}
