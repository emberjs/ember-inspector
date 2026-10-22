import { on } from '@ember/modifier';
import svgJar from 'ember-svg-jar/helpers/svg-jar';
import ToolbarDivider from 'ember-inspector/components/ui/toolbar-divider';
import ToolbarSearchField from 'ember-inspector/components/ui/toolbar-search-field';
import { fn } from '@ember/helper';
<template>
  <div class="toolbar">
    <button
      class="{{if @isInspecting 'active'}} toolbar-icon-button"
      type="button"
      {{on "click" @toggleInspect}}
    >
      {{svgJar "inspect" width="16px" height="17px"}}
    </button>

    <ToolbarDivider />

    <button
      class="toolbar-icon-button"
      title="expand all"
      type="button"
      {{on "click" @expandAll}}
    >
      {{svgJar "chevron-down" width="16px" height="16px"}}
    </button>

    <button
      class="toolbar-icon-button"
      title="collapse all"
      type="button"
      {{on "click" @collapseAll}}
    >
      {{svgJar "chevron-right" width="16px" height="16px"}}
    </button>

    <ToolbarDivider />

    <ToolbarSearchField
      @clear={{fn (mut @query)}}
      @value={{@query}}
      data-test-filter-views
    />

    <ToolbarDivider />

    {{#if @pinned}}
      <button
        class="{{if @showParentsOnly 'active'}} toolbar-icon-button"
        type="button"
        title="toggle focus mode"
        data-test-toggle-focus
        {{on "click" @toggleParentsOnly}}
      >
        {{svgJar "focus-point-round" width="16px" height="16px"}}
      </button>
    {{/if}}
  </div>
</template>
