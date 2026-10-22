import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';

export default class ResizableColumn extends Component {
  <template>
    <div style={{this.style}} ...attributes>
      {{yield}}
    </div>
  </template>
  get style() {
    return htmlSafe(
      `-webkit-flex: none; flex: none; width: ${this.args.width}px;`,
    );
  }
}
