import { observes } from '@ember-decorators/object';
import { or, equal, not } from '@ember/object/computed';
import { once } from '@ember/runloop';
import { typeOf, isEmpty } from '@ember/utils';
// eslint-disable-next-line ember/no-observers
import EmberObject, { computed } from '@ember/object';
import escapeRegExp from 'ember-inspector/utils/escape-reg-exp';

const dateComputed = function () {
  return computed({
    get() {
      return null;
    },
    set(key, date) {
      if (typeOf(date) === 'date') {
        return date;
      } else if (typeof date === 'number' || typeof date === 'string') {
        return new Date(date);
      }
      return null;
    },
  });
};

export default class Promise extends EmberObject {
  @dateComputed()
  createdAt;

  @dateComputed()
  settledAt;

  parent = null;

  @computed('parent.level')
  get level() {
    let parent = this.parent;
    if (!parent) {
      return 0;
    }
    return parent.get('level') + 1;
  }

  @or('isFulfilled', 'isRejected')
  isSettled;

  @equal('state', 'fulfilled')
  isFulfilled;

  @equal('state', 'rejected')
  isRejected;

  @not('isSettled')
  isPending;

  children = [];

  @computed('isPending', 'children.@each.pendingBranch')
  get pendingBranch() {
    return this.recursiveState('isPending', 'pendingBranch');
  }

  @computed('isRejected', 'children.@each.rejectedBranch')
  get rejectedBranch() {
    return this.recursiveState('isRejected', 'rejectedBranch');
  }

  @computed('isFulfilled', 'children.@each.fulfilledBranch')
  get fulfilledBranch() {
    return this.recursiveState('isFulfilled', 'fulfilledBranch');
  }

  recursiveState(prop, cp) {
    if (this.get(prop)) {
      return true;
    }
    for (let i = 0; i < this.get('children.length'); i++) {
      if (this.children.at(i).get(cp)) {
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
      (this.pendingBranch && !this.get('parent.pendingBranch')) ||
      (this.fulfilledBranch && !this.get('parent.fulfilledBranch')) ||
      (this.rejectedBranch && !this.get('parent.rejectedBranch'))
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

  addBranchLabel(label, replace) {
    if (isEmpty(label)) {
      return;
    }
    if (replace) {
      this.set('branchLabel', label);
    } else {
      this.set('branchLabel', `${this.branchLabel} ${label}`);
    }

    let parent = this.parent;
    if (parent) {
      parent.addBranchLabel(label);
    }
  }

  branchLabel = '';

  matches(val) {
    return !!this.branchLabel
      .toLowerCase()
      .match(new RegExp(`.*${escapeRegExp(val.toLowerCase())}.*`));
  }

  matchesExactly(val) {
    return !!(this.label || '')
      .toLowerCase()
      .match(new RegExp(`.*${escapeRegExp(val.toLowerCase())}.*`));
  }

  // EXPANDED / COLLAPSED PROMISES

  isExpanded = false;

  isManuallyExpanded = undefined;

  // eslint-disable-next-line ember/no-observers
  @observes('isPending', 'isFulfilled', 'isRejected', 'parent')
  stateOrParentChanged() {
    let parent = this.parent;
    if (parent) {
      once(parent, 'recalculateExpanded');
    }
  }

  _findTopParent() {
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
      for (let i = 0, l = children.length; i < l; i++) {
        let child = children[i];
        if (child.get('isRejected')) {
          isExpanded = true;
        }
        if (child.get('isPending') && !child.get('parent.isPending')) {
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
      } else if (this.get('parent.isExpanded')) {
        this.parent.recalculateExpanded();
      }
    }
    this.set('isExpanded', isExpanded);
    return isExpanded;
  }

  @computed('parent.{isExpanded,isVisible}', 'parent')
  get isVisible() {
    if (this.parent) {
      return this.get('parent.isExpanded') && this.get('parent.isVisible');
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

  _allParents() {
    let parent = this.parent;
    if (parent) {
      return [parent, ...parent._allParents()];
    } else {
      return [];
    }
  }
}
