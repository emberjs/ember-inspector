import ReloadIcon from 'ember-inspector/svg/reload.svg?unsafe-inline';
<template>
  <button
    title="Reload"
    class="toolbar-icon-button"
    ...attributes
    {{on "click" @action}}
    type="button"
  >
    <ReloadIcon width="13px" height="13px" />
  </button>
</template>
