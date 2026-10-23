import svgJar from 'ember-inspector/helpers/svg-jar';
<template>
  <button
    title="Reload"
    class="toolbar-icon-button"
    ...attributes
    {{on "click" @action}}
    type="button"
  >
    {{svgJar "reload" width="13px" height="13px"}}
  </button>
</template>
