{{#if this.toolbarContainer}}
  {{#in-element this.toolbarContainer}}
    <ContainerTypeToolbar
      @reload={{this.refresh}}
      @searchValue={{this.searchValue}}
      @sendContainerToConsole={{this.sendContainerToConsole}}
    />
  {{/in-element}}
{{/if}}

<InspectorTable
  @columns={{this.columns}}
  @rows={{this.rows}}
  @sorts={{this.sorts}}
  @onUpdateSorts={{this.updateSorts}}
  as |Row index|
>
  <Row
    class={{if (mod index 2) "striped"}}
    data-test-instance-row
    as |Cell|
  >
    <Cell as |name instance|>
      {{#if instance.inspectable}}
        <div
          data-test-instance={{name}}
          class="is-link"
          role="button"
          {{on "click" (fn this.inspectInstance instance)}}
        >
          {{instance.name}}
        </div>
      {{else}}
        <span data-test-instance={{name}}>
          {{instance.name}}
        </span>
      {{/if}}
    </Cell>
  </Row>
</InspectorTable>