import Ember from "ember";
const { computed } = Ember;
const { alias, notEmpty, empty, gt, equal } = computed;

const COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400'
};

export default Ember.ObjectProxy.extend({
  promiseTreeController: computed(function() {
    return this.container.lookup('controller:promiseTree');
  }),

  filter: alias('promiseTreeController.filter'),
  effectiveSearch: alias('promiseTreeController.effectiveSearch'),

  model: alias('content'),

  isError: equal('reason.type', 'type-error'),

  style: computed('model.state', function() {
    let color = '';
    if (this.get('isFulfilled')) {
      color = 'green';
    } else if (this.get('isRejected')) {
      color = 'red';
    } else {
      color = 'blue';
    }
    return Ember.String.htmlSafe(`background-color: ${COLOR_MAP[color]}; color: white;`);
  }),


  nodeStyle: computed('state', 'filter', 'effectiveSearch', function() {
    let relevant;
    switch (this.get('filter')) {
    case 'pending':
      relevant = this.get('isPending');
      break;
    case 'rejected':
      relevant = this.get('isRejected');
      break;
    case 'fulfilled':
      relevant = this.get('isFulfilled');
      break;
    default:
      relevant = true;
    }
    if (relevant && !Ember.isEmpty(this.get('effectiveSearch'))) {
      relevant = this.get('model').matchesExactly(this.get('effectiveSearch'));
    }
    return Ember.String.htmlSafe(!relevant ? 'opacity: 0.3;' : '');
  }),

  labelStyle: computed('level', function() {
    return Ember.String.htmlSafe(`padding-left: ${+this.get('level') * 20 + 5}px;`);
  }),

  expandedClass: computed('hasChildren', 'isExpanded', function() {
    if (!this.get('hasChildren')) { return; }

    if (this.get('isExpanded')) {
      return 'row_arrow_expanded';
    } else {
      return 'row_arrow_collapsed';
    }
  }),

  hasChildren: gt('children.length', 0),

  isTopNode: empty('parent'),

  settledValue: computed('value', function() {
    if (this.get('isFulfilled')) {
      return this.get('value');
    } else if (this.get('isRejected')) {
      return this.get('reason');
    } else {
      return '--';
    }
  }),

  isValueInspectable: notEmpty('settledValue.objectId'),

  hasValue: computed('settledValue', 'isSettled', function() {
    return this.get('isSettled') && this.get('settledValue.type') !== 'type-undefined';
  }),

  label: computed('model.label', function() {
    return this.get('model.label') || (!!this.get('model.parent') && 'Then') || '<Unknown Promise>';
  }),

  state: computed('model.state', function() {
    if (this.get('isFulfilled')) {
      return 'Fulfilled';
    } else if (this.get('isRejected')) {
      return 'Rejected';
    } else if (this.get('parent') && !this.get('parent.isSettled')) {
      return 'Waiting for parent';
    } else {
      return 'Pending';
    }

  }),


  timeToSettle: computed('createdAt', 'settledAt', 'parent.settledAt', function() {
    if (!this.get('createdAt') || !this.get('settledAt')) {
      return ' -- ';
    }
    let startedAt = this.get('parent.settledAt') || this.get('createdAt');
    let remaining = this.get('settledAt').getTime() - startedAt.getTime();
    return remaining;
  })
});
