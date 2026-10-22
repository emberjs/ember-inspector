import svgJar from 'ember-svg-jar/helpers/svg-jar';
<template>
  <div
    class="empty-message flex flex-col items-center justify-center h-full text-center text-base11 text-4xl"
    ...attributes
  >
    {{svgJar "ember-icon-empty" width="129px" height="129px"}}
    <div class="empty-message-content pt-4 px-6">{{yield}}</div>
  </div>
</template>
