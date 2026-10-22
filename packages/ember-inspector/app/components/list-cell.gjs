<td
  class="list-cell
    {{if this.clickable 'list-cell-clickable'}}
    {{if this.highlight 'list-cell-highlight'}}"
  role="button"
  style={{this.safeStyle}}
  title={{this.title}}
  {{on "click" this.click}}
  ...attributes
>
  {{yield}}
</td>