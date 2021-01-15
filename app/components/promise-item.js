import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { isEmpty } from '@ember/utils';
import { notEmpty, gt, equal } from '@ember/object/computed';

const COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400',
};

export default class PromiseItemComponent extends Component {
  filter = null;
  effectiveSearch = null;

  @gt('args.model.children.length', 0) hasChildren;
  @notEmpty('settledValue.objectId') isValueInspectable;
  @equal('args.model.reason.type', 'type-error') isError;

  @computed('args.model.{isFulfilled,isRejected,state}')
  get style() {
    let color = '';
    if (this.args.model?.isFulfilled) {
      color = 'green';
    } else if (this.args.model?.isRejected) {
      color = 'red';
    } else {
      color = 'blue';
    }
    return htmlSafe(`background-color: ${COLOR_MAP[color]}; color: white;`);
  }

  @computed(
    'effectiveSearch',
    'filter',
    'args.model.{isFulfilled,isPending,isRejected,state}'
  )
  get nodeStyle() {
    let relevant;
    switch (this.filter) {
      case 'pending':
        relevant = this.args.model?.isPending;
        break;
      case 'rejected':
        relevant = this.args.model?.isRejected;
        break;
      case 'fulfilled':
        relevant = this.args.model?.isFulfilled;
        break;
      default:
        relevant = true;
    }
    if (relevant && !isEmpty(this.effectiveSearch)) {
      relevant = this.args.model.matchesExactly(this.effectiveSearch);
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
      `padding-left: ${+this.args.model?.level * 20 + 5}px;${this.nodeStyle}`
    );
  }

  @computed('hasChildren', 'args.model.isExpanded')
  get expandedClass() {
    if (!this.hasChildren) {
      return undefined;
    }

    if (this.args.model?.isExpanded) {
      return 'list__cell_arrow_expanded';
    } else {
      return 'list__cell_arrow_collapsed';
    }
  }

  @computed('args.model.{isFulfilled,isRejected,reason,value}')
  get settledValue() {
    if (this.args.model?.isFulfilled) {
      return this.args.model?.value;
    } else if (this.args.model?.isRejected) {
      return this.args.model?.reason;
    } else {
      return '--';
    }
  }

  @computed('args.model.isSettled', 'settledValue.type')
  get hasValue() {
    return (
      this.args.model?.isSettled && this.settledValue?.type !== 'type-undefined'
    );
  }

  @computed('args.model.{label,parent}')
  get label() {
    return (
      this.args.model?.label ||
      (!!this.args.model?.parent && 'Then') ||
      '<Unknown Promise>'
    );
  }

  @computed('args.model.{parent.isSettled,isFulfilled,isRejected,state}')
  get state() {
    if (this.args.model?.isFulfilled) {
      return 'Fulfilled';
    } else if (this.args.model?.isRejected) {
      return 'Rejected';
    } else if (this.args.model?.parent && !this.args.model?.parent?.isSettled) {
      return 'Waiting for parent';
    } else {
      return 'Pending';
    }
  }

  @computed('args.model.{createdAt,settledAt,parent.settledAt}')
  get timeToSettle() {
    if (!this.args.model?.createdAt || !this.args.model?.settledAt) {
      return ' -- ';
    }
    let startedAt =
      this.args.model?.parent?.settledAt || this.args.model?.createdAt;
    let remaining = this.args.model?.settledAt?.getTime() - startedAt.getTime();
    return remaining;
  }
}
