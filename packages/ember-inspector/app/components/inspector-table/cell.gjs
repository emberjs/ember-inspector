import Component from '@glimmer/component';
import { get } from '@ember/object';

export default class InspectorTableCell extends Component {
  <template>
    <td ...attributes>
      {{#if (has-block)}}
        {{yield this.value @data}}
      {{else}}
        {{this.value}}
      {{/if}}
    </td>
  </template>
  get value() {
    return get(this.args.data, this.args.column.key);
  }
}
