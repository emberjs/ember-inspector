import RecordsToolbar from 'ember-inspector/components/records-toolbar';
import InspectorTable from 'ember-inspector/components/inspector-table';
import mod from 'ember-math-helpers/helpers/mod';
<template>
  {{#if @controller.toolbarContainer}}
    {{#in-element @controller.toolbarContainer}}
      <RecordsToolbar
        @filters={{@controller.filters}}
        @filterValue={{@controller.filterValue}}
        @searchValue={{@controller.searchValue}}
        @setFilter={{@controller.setFilter}}
      />
    {{/in-element}}
  {{/if}}

  <InspectorTable
    @columns={{@controller.columns}}
    @rows={{@controller.filteredRecords}}
    @sorts={{@controller.sorts}}
    @onUpdateSorts={{@controller.updateSorts}}
    @reorderable={{true}}
    @selection={{@controller.selection}}
    @onSelect={{@controller.inspectModel}}
    as |Row index|
  >
    <Row class={{if (mod index 2) "striped"}} data-test-table-row as |Cell|>
      <Cell data-test-table-cell as |value row|>
        <span class={{row.color}}>
          {{value}}
        </span>
      </Cell>
    </Row>
  </InspectorTable>
</template>
