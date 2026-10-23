import svgJar from 'ember-svg-jar/helpers/svg-jar';
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
      {{svgJar "disclosure-triangle" width="9px" height="9px"}}
    </button>
  {{else}}
    <span
      class="disclosure-triangle {{if @expanded 'expanded' 'collapsed'}}"
      ...attributes
    >
      {{svgJar "disclosure-triangle" width="9px" height="9px"}}
    </span>
  {{/if}}
</template>
