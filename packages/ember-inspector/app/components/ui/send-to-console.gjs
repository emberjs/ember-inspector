import svgJar from 'ember-svg-jar/helpers/svg-jar';
<template>
  <button
    data-test-send-to-console-btn
    class="send-to-console"
    title="Send to Console"
    type="button"
    {{on "click" (fn @action @param)}}
  >
    {{svgJar "send-with-text" width="20px" height="10px"}}
  </button>
</template>
