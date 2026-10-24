import ToolbarClearButton from 'ember-inspector/components/ui/toolbar-clear-button';
import ToolbarDivider from 'ember-inspector/components/ui/toolbar-divider';
import { Input } from '@ember/component';
import ToolbarSearchField from 'ember-inspector/components/ui/toolbar-search-field';
<template>
  <div class="toolbar">
    <ToolbarClearButton @action={{@clear}} data-test-deprecations-clear />

    <ToolbarDivider />

    <div class="toolbar-checkbox">
      <label title="Deprecation workflow">
        <Input
          @type="checkbox"
          @checked={{@toggleDeprecationWorkflow}}
          {{on "change" @changeDeprecationWorkflow}}
        />
        Toggle for Deprecation Workflow
      </label>
    </div>

    <ToolbarDivider />

    <ToolbarSearchField
      @clear={{fn (mut @searchValue)}}
      @value={{@searchValue}}
      data-test-deprecations-search
    />
  </div>
</template>
