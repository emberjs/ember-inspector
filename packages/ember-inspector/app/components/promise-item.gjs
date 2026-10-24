/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed, get } from '@ember/object';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { equal, gt, notEmpty } from '@ember/object/computed';
import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { isEmpty } from '@ember/utils';
import { concat } from '@ember/helper';
import svgJar from 'ember-svg-jar/helpers/svg-jar';
import SendToConsole from 'ember-inspector/components/ui/send-to-console';
import msToTime from 'ember-inspector/helpers/ms-to-time';

const COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400',
};

export default class PromiseItem extends Component {
  <template>
    <@list.cell
      class={{concat "list-cell-main " this.expandedClass}}
      style={{this.labelStyle}}
      @on-click={{fn @toggleExpand @model}}
    >
      <div class="list-cell-partial list-cell-partial-size-medium">
        <span title={{this.label}} class="js-promise-label">
          <span class="list-cell-arrow"></span>
          {{this.label}}
        </span>
      </div>
      <div class="list-cell-helper">
        {{#if @model.hasStack}}
          <button
            class="send-to-console send-to-console-chevron-only js-trace-promise-btn"
            title="Trace promise in console"
            {{on "click" (fn @tracePromise @model)}}
            type="button"
          >
            {{svgJar "send-with-chevron" width="6px" height="9px"}}
            Trace
          </button>
        {{/if}}
      </div>
    </@list.cell>

    <@list.cell>
      <div
        class="pill pill-text font-bold js-promise-state"
        style={{this.style}}
      >
        {{this.state}}
      </div>
    </@list.cell>

    <@list.cell class="js-promise-value">
      {{#if this.hasValue}}
        <div
          class="list-cell-partial list-cell-partial-size-medium"
          title={{this.settledValue.inspect}}
        >
          {{#if this.isValueInspectable}}
            <span
              class="list-link js-promise-object-value"
              role="button"
              {{on "click" (fn @inspectObject this.settledValue.objectId)}}
            >
              {{this.settledValue.inspect}}
            </span>
          {{else}}
            {{this.settledValue.inspect}}
          {{/if}}
        </div>

        <div class="list-cell-helper">
          {{#if this.isError}}
            <button
              data-test-send-to-console-btn
              class="send-to-console send-to-console-chevron-only"
              title="Send stack trace to the console"
              type="button"
              {{on "click" (fn @sendValueToConsole @model)}}
            >
              {{svgJar "send-with-chevron" width="6px" height="9px"}}
              Stack Trace
            </button>
          {{else}}
            <SendToConsole @action={{@sendValueToConsole}} @param={{@model}} />
          {{/if}}
        </div>
      {{else}}
        --
      {{/if}}
    </@list.cell>

    <@list.cell class="list-cell list-cell-value_numeric js-promise-time">
      {{msToTime this.timeToSettle}}
    </@list.cell>
  </template>
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
    let remaining = this.args.model.settledAt.getTime() - startedAt.getTime();
    return remaining;
  }
}
