import InspectIcon from 'ember-inspector/svg/inspect.svg?unsafe-inline';
import ChevronDownIcon from 'ember-inspector/svg/chevron-down.svg?unsafe-inline';
import ChevronRightIcon from 'ember-inspector/svg/chevron-right.svg?unsafe-inline';
import FocusPointRoundIcon from 'ember-inspector/svg/focus-point-round.svg?unsafe-inline';
import ToolbarDivider from 'ember-inspector/components/ui/toolbar-divider';
import ToolbarSearchField from 'ember-inspector/components/ui/toolbar-search-field';
<template>
  <div class="toolbar">
    <button
      class="{{if @isInspecting 'active'}} toolbar-icon-button"
      type="button"
      {{on "click" @toggleInspect}}
    >
      <InspectIcon width="16px" height="17px" />
    </button>

    <ToolbarDivider />

    <button
      class="toolbar-icon-button"
      title="expand all"
      type="button"
      {{on "click" @expandAll}}
    >
      <ChevronDownIcon width="16px" height="16px" />
    </button>

    <button
      class="toolbar-icon-button"
      title="collapse all"
      type="button"
      {{on "click" @collapseAll}}
    >
      <ChevronRightIcon width="16px" height="16px" />
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
        <FocusPointRoundIcon width="16px" height="16px" />
      </button>
    {{/if}}
  </div>
</template>
