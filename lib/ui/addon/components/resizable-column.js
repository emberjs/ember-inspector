import { tagName } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Component from '@ember/component';
import { htmlSafe } from '@ember/template';

@tagName('')
export default class ResizableColumn extends Component {
  width = null;

  @computed('width')
  get style() {
    return htmlSafe(`-webkit-flex: none; flex: none; width: ${this.width}px;`);
  }
}
