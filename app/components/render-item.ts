import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import escapeRegExp from 'ember-inspector/utils/escape-reg-exp';

interface RenderItemArgs {
  list: any;
  model: any;
  search: string;
  target: { level: number };
}

export default class RenderItem extends Component<RenderItemArgs> {
  get hasChildren() {
    return Number(this.args.model?.children?.length) > 0;
  }

  get level() {
    let parentLevel = this.args.target?.level ?? -1;

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
    let d = new Date(this.args.model?.timestamp);
    let ms = d.getMilliseconds();
    let seconds = d.getSeconds();
    let minutes =
      d.getMinutes().toString().length === 1
        ? `0${d.getMinutes()}`
        : d.getMinutes();
    let hours =
      d.getHours().toString().length === 1 ? `0${d.getHours()}` : d.getHours();

    return `${hours}:${minutes}:${seconds}:${ms}`;
  }

  get searchMatch() {
    let search = this.args.search;
    if (isEmpty(search)) {
      return true;
    }
    let name = this.args.model?.name;
    let regExp = new RegExp(escapeRegExp(search.toLowerCase()) as string);
    return !!name.toLowerCase().match(regExp);
  }
}
