import EmberIconEmptyIcon from 'ember-inspector/svg/ember-icon-empty.svg?unsafe-inline';
<template>
  <div
    class="empty-message flex flex-col items-center justify-center h-full text-center text-base11 text-4xl"
    ...attributes
  >
    <EmberIconEmptyIcon width="129px" height="129px" />
    <div class="empty-message-content pt-4 px-6">{{yield}}</div>
  </div>
</template>
