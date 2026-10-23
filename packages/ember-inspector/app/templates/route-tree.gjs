import RouteTreeToolbar from 'ember-inspector/components/route-tree-toolbar';
import InspectorTable from 'ember-inspector/components/inspector-table';
import schemaFor from 'ember-inspector/helpers/schema-for';
import { concat, get } from '@ember/helper';
import mod from 'ember-math-helpers/helpers/mod';
<template>
  {{#if @controller.toolbarContainer}}
    {{#in-element @controller.toolbarContainer}}
      <RouteTreeToolbar
        @options={{@controller.options}}
        @searchValue={{@controller.searchValue}}
      />
    {{/in-element}}
  {{/if}}

  {{#if @controller.model.error}}
    <p>
      Routes could not be loaded.
      {{@controller.model.error}}
    </p>
  {{/if}}

  <InspectorTable
    @columns={{schemaFor "route-tree"}}
    @rows={{@controller.rows}}
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
        {{#let (get @controller.routeCells column.key) as |RouteCell|}}
          <RouteCell
            @route={{route}}
            @currentRoute={{@controller.currentRoute}}
            @inspectController={{fn
              @controller.inspectController
              route.value.controller
            }}
            @inspectRoute={{fn
              @controller.inspectRoute
              route.value.routeHandler.name
            }}
            @sendControllerToConsole={{@controller.sendControllerToConsole}}
            @sendRouteHandlerToConsole={{@controller.sendRouteHandlerToConsole}}
          />
        {{/let}}
      </Cell>
    </Row>
  </InspectorTable>
</template>
