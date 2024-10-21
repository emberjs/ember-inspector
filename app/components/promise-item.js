import { computed, get } from '@ember/object';
import { equal, gt, notEmpty } from '@ember/object/computed';
import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { isEmpty } from '@ember/utils';

const COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400',
};

export default class PromiseItem extends Component {
  @equal('args.model.reason.type', 'type-error')
  isError;

  @computed('args.model.{isFulfilled,isRejected,state}')
  get style() {
    let color = '';
    if (get(this, 'args.model.isFulfilled')) {
      color = 'green';
    } else if (get(this, 'args.model.isRejected')) {
      color = 'red';
    } else {
      color = 'blue';
    }
    return htmlSafe(`background-color: ${COLOR_MAP[color]}; color: white;`);
  }

  @computed(
    'args.{effectiveSearch,filter}',
    'args.model.{isFulfilled,isPending,isRejected,state}',
  )
  get nodeStyle() {
    let relevant;
    switch (this.args.filter) {
      case 'pending':
        relevant = get(this, 'args.model.isPending');
        break;
      case 'rejected':
        relevant = get(this, 'args.model.isRejected');
        break;
      case 'fulfilled':
        relevant = get(this, 'args.model.isFulfilled');
        break;
      default:
        relevant = true;
    }
    if (relevant && !isEmpty(this.args.effectiveSearch)) {
      relevant = this.args.model.matchesExactly(this.args.effectiveSearch);
    }
    if (!relevant) {
      return 'opacity: 0.3;';
    } else {
      return '';
    }
  }

  @computed('args.model.level', 'nodeStyle')
  get labelStyle() {
    return htmlSafe(
      `padding-left: ${+get(this, 'args.model.level') * 20 + 5}px;${
        this.nodeStyle
      }`,
    );
  }

  @computed('hasChildren', 'args.model.isExpanded')
  get expandedClass() {
    if (!this.hasChildren) {
      return undefined;
    }

    if (get(this, 'args.model.isExpanded')) {
      return 'list-cell-arrow-expanded';
    } else {
      return 'list-cell-arrow-collapsed';
    }
  }

  @gt('args.model.children.length', 0)
  hasChildren;

  @computed('args.model.{isFulfilled,isRejected,reason,value}')
  get settledValue() {
    if (get(this, 'args.model.isFulfilled')) {
      return get(this, 'args.model.value');
    } else if (get(this, 'args.model.isRejected')) {
      return get(this, 'args.model.reason');
    } else {
      return '--';
    }
  }

  @notEmpty('settledValue.objectId')
  isValueInspectable;

  @computed('args.model.isSettled', 'settledValue.type')
  get hasValue() {
    return (
      get(this, 'args.model.isSettled') &&
      get(this, 'settledValue.type') !== 'type-undefined'
    );
  }

  @computed('args.model.{label,parent}')
  get label() {
    return (
      get(this, 'args.model.label') ||
      (!!get(this, 'args.model.parent') && 'Then') ||
      '<Unknown Promise>'
    );
  }

  @computed('args.model.{parent.isSettled,isFulfilled,isRejected,state}')
  get state() {
    if (get(this, 'args.model.isFulfilled')) {
      return 'Fulfilled';
    } else if (get(this, 'args.model.isRejected')) {
      return 'Rejected';
    } else if (
      get(this, 'args.model.parent') &&
      !get(this, 'args.model.parent.isSettled')
    ) {
      return 'Waiting for parent';
    } else {
      return 'Pending';
    }
  }

  @computed('args.model.{createdAt,settledAt,parent.settledAt}')
  get timeToSettle() {
    if (
      !get(this, 'args.model.createdAt') ||
      !get(this, 'args.model.settledAt')
    ) {
      return ' -- ';
    }
    let startedAt =
      get(this, 'args.model.parent.settledAt') ||
      get(this, 'args.model.createdAt');
    let remaining =
      get(this, 'args.model.settledAt').getTime() - startedAt.getTime();
    return remaining;
  }
}
