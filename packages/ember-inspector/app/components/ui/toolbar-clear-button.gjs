import Clear2Icon from 'ember-inspector/svg/clear-2.svg?unsafe-inline';
<template>
  <button
    title="clear"
    class="toolbar-icon-button"
    ...attributes
    {{on "click" @action}}
    type="button"
  >
    <Clear2Icon width="13px" height="13px" />
  </button>
</template>
