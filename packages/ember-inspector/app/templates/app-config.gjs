import InspectorTable from 'ember-inspector/components/inspector-table';
import { concat } from '@ember/helper';
import mod from 'ember-math-helpers/helpers/mod';
import EmptyMessage from 'ember-inspector/components/ui/empty-message';
<template>
  {{#if @model}}
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
  {{else}}
    <EmptyMessage class="js-app-config-missing">
      <p>
        No app config found. The app has no config meta tag, and its resolver
        has no
        <code>config:environment</code>.
      </p>
    </EmptyMessage>
  {{/if}}
</template>
