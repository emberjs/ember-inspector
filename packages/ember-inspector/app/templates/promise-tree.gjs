import PromiseTreeToolbar from 'ember-inspector/components/promise-tree-toolbar';
import EmptyMessage from 'ember-inspector/components/ui/empty-message';
import List from 'ember-inspector/components/list';
import schemaFor from 'ember-inspector/helpers/schema-for';
import mod from 'ember-math-helpers/helpers/mod';
import PromiseItem from 'ember-inspector/components/promise-item';
<template>
  {{#if @controller.toolbarContainer}}
    {{#in-element @controller.toolbarContainer}}
      <PromiseTreeToolbar
        @clear={{@controller.clear}}
        @filter={{@controller.filter}}
        @instrumentWithStack={{@controller.instrumentWithStack}}
        @refreshPage={{@controller.adapter.refreshPage}}
        @searchValue={{@controller.searchValue}}
        @setFilter={{@controller.setFilter}}
        @updateInstrumentWithStack={{@controller.updateInstrumentWithStack}}
      />
    {{/in-element}}
  {{/if}}

  {{#if @controller.shouldRefresh}}
    <EmptyMessage class="js-page-refresh">
      <p>
        Reload the page to see promises created before you opened the inspector.
      </p>
      <button
        class="js-page-refresh-btn"
        type="button"
        {{on "click" @controller.adapter.refreshPage}}
      >
        Reload
      </button>
    </EmptyMessage>
  {{else}}
    <List
      class="js-promise-tree"
      @schema={{schemaFor "promise-tree"}}
      as |list|
    >
      <list.vertical-collection
        @items={{@controller.filtered}}
        as |content index|
      >
        <tr
          class="list-row js-promise-tree-item {{if (mod index 2) 'striped'}}"
        >
          <PromiseItem
            @model={{content}}
            @filter={{@controller.filter}}
            @effectiveSearch={{@controller.effectiveSearch}}
            @toggleExpand={{@controller.toggleExpand}}
            @tracePromise={{@controller.tracePromise}}
            @inspectObject={{@controller.inspectObject}}
            @sendValueToConsole={{@controller.sendValueToConsole}}
            @list={{list}}
          />
        </tr>
      </list.vertical-collection>
    </List>
  {{/if}}
</template>
