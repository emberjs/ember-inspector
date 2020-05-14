import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { isEmpty } from '@ember/utils';
import { notEmpty, gt, equal } from '@ember/object/computed';

const COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400',
};

export default Component.extend({
  tagName: '',

  filter: null,
  effectiveSearch: null,

  isError: equal('model.reason.type', 'type-error'),

  style: computed('model.{isFulfilled,isRejected}', function () {
    let color = '';
    if (this.get('model.isFulfilled')) {
      color = 'green';
    } else if (this.get('model.isRejected')) {
      color = 'red';
    } else {
      color = 'blue';
    }
    return htmlSafe(`background-color: ${COLOR_MAP[color]}; color: white;`);
  }),

  nodeStyle: computed(
    'model.{isFulfilled,isPending,isRejected}',
    'filter',
    'effectiveSearch',
    function () {
      let relevant;
      switch (this.filter) {
        case 'pending':
          relevant = this.get('model.isPending');
          break;
        case 'rejected':
          relevant = this.get('model.isRejected');
          break;
        case 'fulfilled':
          relevant = this.get('model.isFulfilled');
          break;
        default:
          relevant = true;
      }
      if (relevant && !isEmpty(this.effectiveSearch)) {
        relevant = this.model.matchesExactly(this.effectiveSearch);
      }
      if (!relevant) {
        return 'opacity: 0.3;';
      } else {
        return '';
      }
    }
  ),

  labelStyle: computed('model.level', 'nodeStyle', function () {
    return htmlSafe(
      `padding-left: ${+this.get('model.level') * 20 + 5}px;${this.nodeStyle}`
    );
  }),

  expandedClass: computed('hasChildren', 'model.isExpanded', function () {
    if (!this.hasChildren) {
      return;
    }

    if (this.get('model.isExpanded')) {
      return 'list__cell_arrow_expanded';
    } else {
      return 'list__cell_arrow_collapsed';
    }
  }),

  hasChildren: gt('model.children.length', 0),

  settledValue: computed(
    'model.{isFulfilled,isRejected,reason,value}',
    function () {
      if (this.get('model.isFulfilled')) {
        return this.get('model.value');
      } else if (this.get('model.isRejected')) {
        return this.get('model.reason');
      } else {
        return '--';
      }
    }
  ),

  isValueInspectable: notEmpty('settledValue.objectId'),

  hasValue: computed('settledValue.type', 'model.isSettled', function () {
    return (
      this.get('model.isSettled') &&
      this.get('settledValue.type') !== 'type-undefined'
    );
  }),

  label: computed('model.{label,parent}', function () {
    return (
      this.get('model.label') ||
      (!!this.get('model.parent') && 'Then') ||
      '<Unknown Promise>'
    );
  }),

  state: computed(
    'model.{isFulfilled,isRejected,parent.isSettled}',
    function () {
      if (this.get('model.isFulfilled')) {
        return 'Fulfilled';
      } else if (this.get('model.isRejected')) {
        return 'Rejected';
      } else if (
        this.get('model.parent') &&
        !this.get('model.parent.isSettled')
      ) {
        return 'Waiting for parent';
      } else {
        return 'Pending';
      }
    }
  ),

  timeToSettle: computed(
    'model.{createdAt,settledAt,parent.settledAt}',
    function () {
      if (!this.get('model.createdAt') || !this.get('model.settledAt')) {
        return ' -- ';
      }
      let startedAt =
        this.get('model.parent.settledAt') || this.get('model.createdAt');
      let remaining =
        this.get('model.settledAt').getTime() - startedAt.getTime();
      return remaining;
    }
  ),
});
