import DisclosureTriangleIcon from 'ember-inspector/svg/disclosure-triangle.svg?unsafe-inline';
<template>
  {{#if @toggle}}
    <button
      class="disclosure-triangle
        {{if @expanded 'expanded' 'collapsed'}}
        appearance-none inline-block border-0 cursor-pointer bg-transparent"
      {{on "click" @toggle}}
      ...attributes
      type="button"
    >
      <DisclosureTriangleIcon width="9px" height="9px" />
    </button>
  {{else}}
    <span
      class="disclosure-triangle {{if @expanded 'expanded' 'collapsed'}}"
      ...attributes
    >
      <DisclosureTriangleIcon width="9px" height="9px" />
    </span>
  {{/if}}
</template>
