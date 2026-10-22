import ToolbarClearButton from 'ember-inspector/components/ui/toolbar-clear-button';
import ToolbarDivider from 'ember-inspector/components/ui/toolbar-divider';
import ToolbarReloadButton from 'ember-inspector/components/ui/toolbar-reload-button';
import ToolbarSearchField from 'ember-inspector/components/ui/toolbar-search-field';
import { fn } from '@ember/helper';
import { Input } from '@ember/component';
import { on } from '@ember/modifier';
<template>
  <div class="toolbar">
    <ToolbarClearButton @action={{@clearProfiles}} />

    {{#unless @showEmpty}}
      <ToolbarDivider />
      <ToolbarReloadButton
        @action={{@refreshPage}}
        class="js-toolbar-page-refresh-btn"
      />
    {{/unless}}

    <ToolbarDivider />

    <ToolbarSearchField
      @clear={{fn (mut @searchValue)}}
      @value={{@searchValue}}
      class="js-render-profiles-search"
    />
    {{#if @isHighlightEnabled}}
      <div class="toolbar-checkbox js-hightlight-render">
        <label>
          <Input
            data-test-options-highlight-render
            @type="checkbox"
            @checked={{@shouldHighlightRender}}
            {{on "change" @updateShouldHighlightRender}}
          />
          Highlight render
        </label>
      </div>
    {{/if}}
  </div>
</template>
