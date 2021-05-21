import { tagName } from '@ember-decorators/component';
import { computed, get } from '@ember/object';
import { gt } from '@ember/object/computed';
import Component from '@ember/component';
import { isNone, isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import escapeRegExp from 'ember-inspector/utils/escape-reg-exp';

@tagName('')
export default class RenderItem extends Component {
  @computed('model.name', 'name', 'search')
  get searchMatch() {
    let search = this.search;
    if (isEmpty(search)) {
      return true;
    }
    let name = get(this, 'model.name');
    let regExp = new RegExp(escapeRegExp(search.toLowerCase()));
    return !!name.toLowerCase().match(regExp);
  }

  @computed('searchMatch')
  get nodeStyle() {
    let style = '';
    if (!this.searchMatch) {
      style = 'opacity: 0.5;';
    }
    return htmlSafe(style);
  }

  @computed('target.level')
  get level() {
    let parentLevel = get(this, 'target.level');
    if (isNone(parentLevel)) {
      parentLevel = -1;
    }
    return parentLevel + 1;
  }

  @computed('level')
  get nameStyle() {
    return htmlSafe(`padding-left: ${+this.level * 20 + 5}px;`);
  }

  @gt('model.children.length', 0)
  hasChildren;

  @computed('model.timestamp')
  get readableTime() {
    let d = new Date(get(this, 'model.timestamp'));
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
}
