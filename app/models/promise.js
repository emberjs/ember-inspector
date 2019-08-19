import { assign } from '@ember/polyfills';
import { once } from '@ember/runloop';
import { typeOf, isEmpty } from '@ember/utils';
import EmberObject, { computed, observer } from '@ember/object';
import { not, equal, or } from '@ember/object/computed';
import escapeRegExp from 'ember-inspector/utils/escape-reg-exp';

const dateComputed = function() {
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
    }
  });
};

export default EmberObject.extend({
  createdAt: dateComputed(),
  settledAt: dateComputed(),

  parent: null,

  level: computed('parent.level', function() {
    let parent = this.parent;
    if (!parent) {
      return 0;
    }
    return parent.get('level') + 1;
  }),

  isSettled: or('isFulfilled', 'isRejected'),

  isFulfilled: equal('state', 'fulfilled'),

  isRejected: equal('state', 'rejected'),

  isPending: not('isSettled'),

  children: computed(function() {
    return [];
  }),

  pendingBranch: computed('isPending', 'children.@each.pendingBranch', function() {
    return this.recursiveState('isPending', 'pendingBranch');
  }),

  rejectedBranch: computed('isRejected', 'children.@each.rejectedBranch', function() {
    return this.recursiveState('isRejected', 'rejectedBranch');
  }),

  fulfilledBranch: computed('isFulfilled', 'children.@each.fulfilledBranch', function() {
    return this.recursiveState('isFulfilled', 'fulfilledBranch');
  }),

  recursiveState(prop, cp) {
    if (this.get(prop)) {
      return true;
    }
    for (let i = 0; i < this.get('children.length'); i++) {
      if (this.children.objectAt(i).get(cp)) {
        return true;
      }
    }
    return false;
  },

  // Need this observer because CP dependent keys do not support nested arrays
  // TODO: This can be so much better
  stateChanged: observer('pendingBranch', 'fulfilledBranch', 'rejectedBranch', function() {
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
  }),

  updateParentLabel: observer('label', 'parent', function() {
    this.addBranchLabel(this.label, true);
  }),

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
  },

  branchLabel: '',

  matches(val) {
    return !!this.branchLabel.toLowerCase().match(new RegExp(`.*${escapeRegExp(val.toLowerCase())}.*`));
  },

  matchesExactly(val) {
    return !!((this.label || '').toLowerCase().match(new RegExp(`.*${escapeRegExp(val.toLowerCase())}.*`)));
  },


  // EXPANDED / COLLAPSED PROMISES

  isExpanded: false,

  isManuallyExpanded: undefined,

  stateOrParentChanged: observer('isPending', 'isFulfilled', 'isRejected', 'parent', function() {
    let parent = this.parent;
    if (parent) {
      once(parent, 'recalculateExpanded');
    }
  }),

  _findTopParent() {
    let parent = this.parent;
    if (!parent) {
      return this;
    } else {
      return parent._findTopParent();
    }
  },

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
        parents.forEach(parent => {
          parent.set('isExpanded', true);
        });
      } else if (this.get('parent.isExpanded')) {
        this.parent.recalculateExpanded();
      }
    }
    this.set('isExpanded', isExpanded);
    return isExpanded;
  },

  isVisible: computed('parent.{isExpanded,isVisible}', 'parent', function() {
    if (this.parent) {
      return this.get('parent.isExpanded') && this.get('parent.isVisible');
    }
    return true;
  }),

  _allChildren() {
    let children = assign([], this.children);
    children.forEach(item => {
      children = assign(children, item._allChildren());
    });
    return children;
  },

  _allParents() {
    let parent = this.parent;
    if (parent) {
      return assign([parent], parent._allParents());
    } else {
      return [];
    }
  }
});
