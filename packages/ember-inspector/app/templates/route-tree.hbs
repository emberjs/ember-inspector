{{#if this.toolbarContainer}}
  {{#in-element this.toolbarContainer}}
    <RouteTreeToolbar
      @options={{this.options}}
      @searchValue={{this.searchValue}}
    />
  {{/in-element}}
{{/if}}

{{#if this.model.error}}
  <p>
      Routes could not be loaded.
      {{this.model.error}}
  </p>
{{/if}}

<InspectorTable
  @columns={{schema-for "route-tree"}}
  @rows={{this.rows}}
  as |Row index|
>
  <Row
    class={{concat
      "list-row js-route-tree-item"
      (if (mod index 2) " striped")
    }}
    as |Cell column|
  >
    <Cell as |route|>
      {{#let (get this.routeCells column.key) as |RouteCell|}}
        <RouteCell
          @route={{route}}
          @currentRoute={{this.currentRoute}}
          @inspectController={{fn this.inspectController route.value.controller}}
          @inspectRoute={{fn this.inspectRoute route.value.routeHandler.name}}
          @sendControllerToConsole={{this.sendControllerToConsole}}
          @sendRouteHandlerToConsole={{this.sendRouteHandlerToConsole}}
        />
      {{/let}}
    </Cell>
  </Row>
</InspectorTable>
