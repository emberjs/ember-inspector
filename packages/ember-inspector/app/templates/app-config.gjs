import InspectorTable from 'ember-inspector/components/inspector-table';
import { concat } from '@ember/helper';
import mod from 'ember-math-helpers/helpers/mod';
<template>
  <InspectorTable
    @columns={{@controller.columns}}
    @rows={{@controller.rows}}
    as |Row index|
  >
    <Row
      class={{concat "js-config-row" (if (mod index 2) " striped")}}
      as |Cell column|
    >
      <Cell class={{concat "js-config-" column.key}} />
    </Row>
  </InspectorTable>
</template>
