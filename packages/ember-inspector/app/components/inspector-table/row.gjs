import Component from '@glimmer/component';

export default class InspectorTableRow extends Component {
  select = () => {
    if (this.args.isSelectable) this.args.onSelect(this.args.data);
  };
}

{{!-- template-lint-disable no-invalid-interactive --}}
<tr
  class="{{if @isSelectable 'is-selectable'}} {{if @isSelected 'is-selected'}}"
  ...attributes
  {{on "click" this.select}}
>
  {{#each @columns as |column|}}
    {{yield
      (component "inspector-table/cell" column=column data=@data)
      column
    }}
  {{/each}}
</tr>
