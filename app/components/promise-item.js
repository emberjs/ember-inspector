import { tagName } from '@ember-decorators/component';
import { computed, get } from '@ember/object';
import { equal, gt, notEmpty } from '@ember/object/computed';
import Component from '@ember/component';
import { htmlSafe } from '@ember/template';
import { isEmpty } from '@ember/utils';

const COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400',
};

@tagName('')
export default class PromiseItem extends Component {
  filter = null;
  effectiveSearch = null;

  @equal('model.reason.type', 'type-error')
  isError;

  @computed('model.{isFulfilled,isRejected,state}')
  get style() {
    let color = '';
    if (get(this, 'model.isFulfilled')) {
      color = 'green';
    } else if (get(this, 'model.isRejected')) {
      color = 'red';
    } else {
      color = 'blue';
    }
    return htmlSafe(`background-color: ${COLOR_MAP[color]}; color: white;`);
  }

  @computed(
    'effectiveSearch',
    'filter',
    'model.{isFulfilled,isPending,isRejected,state}'
  )
  get nodeStyle() {
    let relevant;
    switch (this.filter) {
      case 'pending':
        relevant = get(this, 'model.isPending');
        break;
      case 'rejected':
        relevant = get(this, 'model.isRejected');
        break;
      case 'fulfilled':
        relevant = get(this, 'model.isFulfilled');
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

  @computed('model.level', 'nodeStyle')
  get labelStyle() {
    return htmlSafe(
      `padding-left: ${+get(this, 'model.level') * 20 + 5}px;${this.nodeStyle}`
    );
  }

  @computed('hasChildren', 'model.isExpanded')
  get expandedClass() {
    if (!this.hasChildren) {
      return undefined;
    }

    if (get(this, 'model.isExpanded')) {
      return 'list__cell_arrow_expanded';
    } else {
      return 'list__cell_arrow_collapsed';
    }
  }

  @gt('model.children.length', 0)
  hasChildren;

  @computed('model.{isFulfilled,isRejected,reason,value}')
  get settledValue() {
    if (get(this, 'model.isFulfilled')) {
      return get(this, 'model.value');
    } else if (get(this, 'model.isRejected')) {
      return get(this, 'model.reason');
    } else {
      return '--';
    }
  }

  @notEmpty('settledValue.objectId')
  isValueInspectable;

  @computed('model.isSettled', 'settledValue.type')
  get hasValue() {
    return (
      get(this, 'model.isSettled') &&
      get(this, 'settledValue.type') !== 'type-undefined'
    );
  }

  @computed('model.{label,parent}')
  get label() {
    return (
      get(this, 'model.label') ||
      (!!get(this, 'model.parent') && 'Then') ||
      '<Unknown Promise>'
    );
  }

  @computed('model.{parent.isSettled,isFulfilled,isRejected,state}')
  get state() {
    if (get(this, 'model.isFulfilled')) {
      return 'Fulfilled';
    } else if (get(this, 'model.isRejected')) {
      return 'Rejected';
    } else if (
      get(this, 'model.parent') &&
      !get(this, 'model.parent.isSettled')
    ) {
      return 'Waiting for parent';
    } else {
      return 'Pending';
    }
  }

  @computed('model.{createdAt,settledAt,parent.settledAt}')
  get timeToSettle() {
    if (!get(this, 'model.createdAt') || !get(this, 'model.settledAt')) {
      return ' -- ';
    }
    let startedAt =
      get(this, 'model.parent.settledAt') || get(this, 'model.createdAt');
    let remaining =
      get(this, 'model.settledAt').getTime() - startedAt.getTime();
    return remaining;
  }
}
