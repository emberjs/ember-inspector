import { on } from '@ember/modifier';
import svgJar from 'ember-svg-jar/helpers/svg-jar';
<template>
  <button
    title="clear"
    class="toolbar-icon-button"
    ...attributes
    {{on "click" @action}}
    type="button"
  >
    {{svgJar "clear-2" width="13px" height="13px"}}
  </button>
</template>
