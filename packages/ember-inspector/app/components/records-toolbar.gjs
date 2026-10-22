import ToolbarSearchField from 'ember-inspector/components/ui/toolbar-search-field';
import { fn } from '@ember/helper';
import ToolbarDivider from 'ember-inspector/components/ui/toolbar-divider';
import isEmpty from 'ember-truth-helpers/helpers/is-empty';
import { on } from '@ember/modifier';
import eq from 'ember-truth-helpers/helpers/eq';
<template>
  <div class="toolbar">
    <ToolbarSearchField
      @clear={{fn (mut @searchValue)}}
      @value={{@searchValue}}
      class="js-records-search"
    />

    <ToolbarDivider />

    <button
      class="{{if (isEmpty @filterValue) 'active'}} toolbar-radio js-filter"
      type="button"
      {{on "click" (fn @setFilter "")}}
    >
      All
    </button>

    {{#each @filters as |filter|}}
      <button
        class="{{if (eq @filterValue filter.name) 'active'}}
          toolbar-radio js-filter"
        type="button"
        {{on "click" (fn @setFilter filter.name)}}
      >
        {{filter.desc}}
      </button>
    {{/each}}
  </div>
</template>
