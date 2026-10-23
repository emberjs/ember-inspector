import OpenLinksInNewWindow from 'ember-inspector/components/ui/open-links-in-new-window';
import MarkdownToHtml from 'ember-cli-showdown/components/markdown-to-html';
<template>
  <div class="changelog">
    {{#if @controller.error}}
      <h1>Changelog</h1>
      <p>
        Changelog could not be loaded
      </p>
    {{else}}
      {{! CHANGELOG.md starts with its own "# Changelog" heading }}
      <OpenLinksInNewWindow>
        <MarkdownToHtml @markdown={{@controller.model}} />
      </OpenLinksInNewWindow>
    {{/if}}
  </div>
</template>
