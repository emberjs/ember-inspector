import SendWithTextIcon from 'ember-inspector/svg/send-with-text.svg?unsafe-inline';
<template>
  <button
    data-test-send-to-console-btn
    class="send-to-console"
    title="Send to Console"
    type="button"
    {{on "click" (fn @action @param)}}
  >
    <SendWithTextIcon width="20px" height="10px" />
  </button>
</template>
