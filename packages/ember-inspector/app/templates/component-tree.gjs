import ComponentTreeToolbar from 'ember-inspector/components/component-tree-toolbar';
import ScrollContainer from 'ember-inspector/components/scroll-container';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import willDestroy from '@ember/render-modifiers/modifiers/will-destroy';
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
    {{didInsert @controller.arrowKeysSetup}}
    {{willDestroy @controller.arrowKeysTeardown}}
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
