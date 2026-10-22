import ToolbarClearButton from 'ember-inspector/components/ui/toolbar-clear-button';
import ToolbarDivider from 'ember-inspector/components/ui/toolbar-divider';
import ToolbarReloadButton from 'ember-inspector/components/ui/toolbar-reload-button';
import ToolbarSearchField from 'ember-inspector/components/ui/toolbar-search-field';
import { fn } from '@ember/helper';
import eq from 'ember-truth-helpers/helpers/eq';
import { on } from '@ember/modifier';
import { Input } from '@ember/component';
import not from 'ember-truth-helpers/helpers/not';
<template>
  <div class="toolbar">
    <ToolbarClearButton @action={{@clear}} class="js-clear-promises-btn" />

    {{! if should refresh the refresh button will be in the middle of the of the tab }}
    {{#unless this.shouldRefresh}}
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
      class="js-promise-search"
    />

    <ToolbarDivider />

    <button
      class="{{if (eq @filter 'all') 'active'}}
        toolbar-radio toolbar-radio-first js-filter"
      type="button"
      {{on "click" (fn @setFilter "all")}}
    >
      All
    </button>

    <button
      class="{{if (eq @filter 'rejected') 'active'}} toolbar-radio js-filter"
      type="button"
      {{on "click" (fn @setFilter "rejected")}}
    >
      Rejected
    </button>
    <button
      class="{{if (eq @filter 'pending') 'active'}} toolbar-radio js-filter"
      type="button"
      {{on "click" (fn @setFilter "pending")}}
    >
      Pending
    </button>
    <button
      class="{{if (eq @filter 'fulfilled') 'active'}}
        toolbar-radio toolbar-radio-last js-filter"
      type="button"
      {{on "click" (fn @setFilter "fullfilled")}}
    >
      Fulfilled
    </button>

    <ToolbarDivider />

    <div class="toolbar-checkbox js-with-stack">
      <label>
        <Input
          @type="checkbox"
          @checked={{@instrumentWithStack}}
          {{on
            "change"
            (fn @updateInstrumentWithStack (not @instrumentWithStack))
          }}
        />
        Trace promises
      </label>
    </div>
  </div>
</template>
