import RenderTreeToolbar from 'ember-inspector/components/render-tree-toolbar';
import WarningMessage from 'ember-inspector/components/ui/warning-message';
import EmptyMessage from 'ember-inspector/components/ui/empty-message';
import { on } from '@ember/modifier';
import List from 'ember-inspector/components/list';
import schemaFor from 'ember-inspector/helpers/schema-for';
import RenderItem from 'ember-inspector/components/render-item';
<template>
  {{#if @controller.toolbarContainer}}
    {{#in-element @controller.toolbarContainer}}
      <RenderTreeToolbar
        @clearProfiles={{@controller.clearProfiles}}
        @refreshPage={{@controller.adapter.refreshPage}}
        @searchValue={{@controller.searchValue}}
        @showEmpty={{@controller.showEmpty}}
        @shouldHighlightRender={{@controller.shouldHighlightRender}}
        @updateShouldHighlightRender={{@controller.updateShouldHighlightRender}}
        @isHighlightEnabled={{@controller.isHighlightEnabled}}
      />
    {{/in-element}}
  {{/if}}

  {{#unless @controller.isWarningClosed}}
    <WarningMessage @close={{@controller.closeWarning}}>
      Render times may be inaccurate due to instrumentation and environment
    </WarningMessage>
  {{/unless}}

  {{#if @controller.showEmpty}}
    <EmptyMessage class="js-render-tree-empty">
      <p>
        No rendering metrics have been collected. Try reloading or navigating
        around your application.
      </p>
      <p>
        <strong>
          Note:
        </strong>
        Very fast rendering times (&lt;1ms) are excluded.
      </p>
      <button
        class="js-toolbar-page-refresh-btn"
        type="button"
        {{on "click" @controller.adapter.refreshPage}}
      >
        Reload
      </button>
    </EmptyMessage>
  {{else}}
    <List
      class="js-render-tree list-css-striping"
      @headerHeight={{@controller.headerHeight}}
      @schema={{schemaFor "render-tree"}}
      as |list|
    >
      <tbody>
        {{#each @controller.filtered as |item|}}
          <RenderItem
            @model={{item}}
            @search={{@controller.search}}
            @list={{list}}
          />
        {{/each}}
      </tbody>
    </List>
  {{/if}}
</template>
