import ToolbarReloadButton from 'ember-inspector/components/ui/toolbar-reload-button';
import ToolbarDivider from 'ember-inspector/components/ui/toolbar-divider';
import { Input } from '@ember/component';
import { on } from '@ember/modifier';
<template>
  <div class="toolbar">
    <ToolbarReloadButton @action={{@reload}} data-test-reload-container-btn />

    <ToolbarDivider />

    <div class="toolbar-checkbox js-filter-hide-empty-model-types">
      <label>
        <Input
          data-test-options-hideEmptyModelTypes
          @type="checkbox"
          @checked={{@hideEmptyModelTypes}}
        />
        Hide Empty Model Types
      </label>
    </div>
    <div class="toolbar-checkbox js-filter-order-records-by-count">
      <label>
        <Input
          data-test-options-orderByRecordCount
          @type="checkbox"
          @checked={{@orderByRecordCount}}
        />
        Order Models By Record Count
      </label>
    </div>
    <button
      class="toolbar-radio js-filter"
      {{on "click" @getStore}}
      data-test-inspect-store
      type="button"
    >
      Inspect Store
    </button>
  </div>
</template>
