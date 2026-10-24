import { Input } from '@ember/component';
import ToolbarDivider from 'ember-inspector/components/ui/toolbar-divider';
import ToolbarSearchField from 'ember-inspector/components/ui/toolbar-search-field';
<template>
  <div class="toolbar">
    <div class="toolbar-checkbox js-filter-hide-routes">
      <label>
        <Input @type="checkbox" @checked={{@options.hideRoutes}} />
        Current Route only
      </label>
    </div>

    <div class="toolbar-checkbox js-filter-hide-substates">
      <label title="Hide loading and error substates">
        <Input @type="checkbox" @checked={{@options.hideSubstates}} />
        Hide Substates
      </label>
    </div>

    <ToolbarDivider />

    <ToolbarSearchField
      @clear={{fn (mut @searchValue)}}
      @value={{@searchValue}}
      data-test-filter-views
    />
  </div>
</template>
