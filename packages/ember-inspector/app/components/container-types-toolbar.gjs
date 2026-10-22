import ToolbarReloadButton from 'ember-inspector/components/ui/toolbar-reload-button';
import ToolbarDivider from 'ember-inspector/components/ui/toolbar-divider';
import SendToConsole from 'ember-inspector/components/ui/send-to-console';
<template>
  <div class="toolbar">
    <ToolbarReloadButton @action={{@reload}} data-test-reload-container-btn />

    <ToolbarDivider />

    <SendToConsole @action={{@sendContainerToConsole}} />
  </div>
</template>
