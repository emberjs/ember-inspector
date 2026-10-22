import ToolbarReloadButton from 'ember-inspector/components/ui/toolbar-reload-button';
import ToolbarDivider from 'ember-inspector/components/ui/toolbar-divider';
import SendToConsole from 'ember-inspector/components/ui/send-to-console';
import ToolbarSearchField from 'ember-inspector/components/ui/toolbar-search-field';
import { fn } from '@ember/helper';
<template>
  <div class="toolbar">
    <ToolbarReloadButton @action={{@reload}} data-test-reload-container-btn />

    <ToolbarDivider />

    <SendToConsole @action={{@sendContainerToConsole}} />

    <ToolbarDivider />

    <ToolbarSearchField
      @clear={{fn (mut @searchValue)}}
      @value={{@searchValue}}
      data-test-container-instance-search
    />
  </div>
</template>
