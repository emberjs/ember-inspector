import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import InspectorTableCell from 'ember-inspector/components/inspector-table/cell';

export default class InspectorTableRow extends Component {
  <template>
    {{! template-lint-disable no-invalid-interactive }}
    <tr
      class="{{if @isSelectable 'is-selectable'}}
        {{if @isSelected 'is-selected'}}"
      ...attributes
      {{on "click" this.select}}
    >
      {{#each @columns as |column|}}
        {{yield (component InspectorTableCell column=column data=@data) column}}
      {{/each}}
    </tr>
  </template>
  select = () => {
    if (this.args.isSelectable) this.args.onSelect(this.args.data);
  };
}
