import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import escapeRegExp from 'ember-inspector/utils/escape-reg-exp';
import Disclosure from 'ember-inspector/components/ui/disclosure';
import msToTime from 'ember-inspector/helpers/ms-to-time';
import RenderItem0 from 'ember-inspector/components/render-item';

export default class RenderItem extends Component {
  <template>
    <Disclosure as |disclosure|>
      <tr style={{this.nodeStyle}} class="list-row js-render-profile-item">
        <@list.cell
          class="list-cell-main js-render-main-cell"
          @on-click={{disclosure.toggle}}
          style={{this.nameStyle}}
        >
          {{#if this.hasChildren}}
            <disclosure.triangleIcon />
          {{/if}}

          <span title={{@model.name}}>
            <span class="js-render-profile-name">{{@model.name}}</span>
          </span>
        </@list.cell>

        <@list.cell class="list-cell-value_numeric">
          <span class="pill js-render-profile-duration">
            {{msToTime @model.duration}}
          </span>
        </@list.cell>

        <@list.cell class="list-cell-value_numeric js-render-profile-timestamp">
          {{this.readableTime}}
        </@list.cell>
      </tr>

      {{#if disclosure.isExpanded}}
        {{#each @model.children as |child|}}
          <RenderItem0
            @model={{child}}
            @target={{this}}
            @list={{@list}}
            @search={{@search}}
          />
        {{/each}}
      {{/if}}
    </Disclosure>
  </template>
  get hasChildren() {
    return Number(this.args.model?.children?.length) > 0;
  }

  get level() {
    const parentLevel = this.args.target?.level ?? -1;

    return parentLevel + 1;
  }

  get nameStyle() {
    return htmlSafe(`padding-left: ${+this.level * 20 + 5}px;`);
  }

  get nodeStyle() {
    let style = '';
    if (!this.searchMatch) {
      style = 'opacity: 0.5;';
    }
    return htmlSafe(style);
  }

  get readableTime() {
    const d = new Date(this.args.model?.timestamp);
    const ms = d.getMilliseconds();
    const seconds = d.getSeconds();
    const minutes =
      d.getMinutes().toString().length === 1
        ? `0${d.getMinutes()}`
        : d.getMinutes();
    const hours =
      d.getHours().toString().length === 1 ? `0${d.getHours()}` : d.getHours();

    return `${hours}:${minutes}:${seconds}:${ms}`;
  }

  get searchMatch() {
    const search = this.args.search;
    if (isEmpty(search)) {
      return true;
    }
    const name = this.args.model?.name;
    const regExp = new RegExp(escapeRegExp(search.toLowerCase()));
    return !!name.toLowerCase().match(regExp);
  }
}
