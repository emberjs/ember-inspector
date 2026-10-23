import ComponentTreeToolbar from 'ember-inspector/components/component-tree-toolbar';
import ScrollContainer from 'ember-inspector/components/scroll-container';
import onDocument from 'ember-inspector/modifiers/on-document';
import { VerticalCollection } from '@html-next/vertical-collection';
import ComponentTreeItem from 'ember-inspector/components/component-tree-item';
<template>
  {{#if @controller.toolbarContainer}}
    {{#in-element @controller.toolbarContainer}}
      <ComponentTreeToolbar
        @collapseAll={{@controller.collapseAll}}
        @expandAll={{@controller.expandAll}}
        @isInspecting={{@controller.isInspecting}}
        @query={{@controller.query}}
        @pinned={{@controller.pinned}}
        @toggleParentsOnly={{@controller.toggleParentsOnly}}
        @showParentsOnly={{@controller.showParentsOnly}}
        @toggleInspect={{@controller.toggleInspect}}
      />
    {{/in-element}}
  {{/if}}

  <ScrollContainer
    @collection={{@controller.visibleItems}}
    @currentItem={{@controller.currentItem}}
    @previewing={{@controller.currentPreviewItem}}
    @itemHeight={{@controller.itemHeight}}
    class="list-content"
    tabindex="-1"
    {{onDocument "keydown" @controller.handleKeyDown}}
  >
    <VerticalCollection
      @estimateHeight={{@controller.itemHeight}}
      @items={{@controller.visibleItems}}
      @key="id"
      as |item|
    >
      <ComponentTreeItem @item={{item}} />
    </VerticalCollection>
  </ScrollContainer>
</template>
