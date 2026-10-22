import LibrariesToolbar from 'ember-inspector/components/libraries-toolbar';
import InspectorTable from 'ember-inspector/components/inspector-table';
import schemaFor from 'ember-inspector/helpers/schema-for';
import { concat } from '@ember/helper';
import mod from 'ember-math-helpers/helpers/mod';
<template>
  {{#if @controller.toolbarContainer}}
    {{#in-element @controller.toolbarContainer}}
      <LibrariesToolbar />
    {{/in-element}}
  {{/if}}

  <InspectorTable
    @columns={{schemaFor "info-list"}}
    @rows={{@controller.rows}}
    as |Row index|
  >
    <Row
      class={{concat "js-library-row" (if (mod index 2) " striped")}}
      as |Cell column|
    >
      <Cell class={{concat "js-lib-" column.key}} />
    </Row>
  </InspectorTable>
</template>
