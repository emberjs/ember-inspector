import { trustHTML } from '@ember/template';
import showdown from 'showdown';

const converter = new showdown.Converter();

function toHtml(markdown) {
  return trustHTML(converter.makeHtml(markdown ?? ''));
}

<template>
  <div ...attributes>{{toHtml @markdown}}</div>
</template>
