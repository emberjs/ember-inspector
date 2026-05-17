/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import escapeRegExp from 'ember-inspector/utils/escape-reg-exp';

interface RenderItemArgs {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any;
  search: string;
  target: { level: number };
}

export const indentItem = (level: number) => +level * 20 + 5;

export default class RenderItem extends Component<RenderItemArgs> {
  get hasChildren() {
    return Number(this.args.model?.children?.length) > 0;
  }

  get level() {
    const parentLevel = this.args.target?.level ?? -1;

    return parentLevel + 1;
  }

  get nameStyle() {
    return htmlSafe(`padding-left: ${indentItem(this.level)}px;`);
  }

  get nodeStyle() {
    let style = '';
    if (!this.searchMatch) {
      style = 'opacity: 0.5;';
    }
    return htmlSafe(style);
  }

  get readableTime() {
    const d = new Date(this.args.model?.timestamp as string);
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
    const name = this.args.model?.name as string;
    const regExp = new RegExp(escapeRegExp(search.toLowerCase()) as string);
    return !!name.toLowerCase().match(regExp);
  }
}
