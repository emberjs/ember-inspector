<td ...attributes>
  {{#if (has-block)}}
    {{yield this.value @data}}
  {{else}}
    {{this.value}}
  {{/if}}
</td>
