import ContainerTypeToolbar from 'ember-inspector/components/container-type-toolbar';
import InspectorTable from 'ember-inspector/components/inspector-table';
import mod from 'ember-math-helpers/helpers/mod';
<template>
  {{#if @controller.toolbarContainer}}
    {{#in-element @controller.toolbarContainer}}
      <ContainerTypeToolbar
        @reload={{@controller.refresh}}
        @searchValue={{@controller.searchValue}}
        @sendContainerToConsole={{@controller.sendContainerToConsole}}
      />
    {{/in-element}}
  {{/if}}

  <InspectorTable
    @columns={{@controller.columns}}
    @rows={{@controller.rows}}
    @sorts={{@controller.sorts}}
    @onUpdateSorts={{@controller.updateSorts}}
    as |Row index|
  >
    <Row class={{if (mod index 2) "striped"}} data-test-instance-row as |Cell|>
      <Cell as |name instance|>
        {{#if instance.inspectable}}
          <div
            data-test-instance={{name}}
            class="is-link"
            role="button"
            {{on "click" (fn @controller.inspectInstance instance)}}
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
</template>
