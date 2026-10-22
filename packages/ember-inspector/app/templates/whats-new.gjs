import RouteTemplate from 'ember-route-template';
import OpenLinksInNewWindow from 'ember-inspector/components/ui/open-links-in-new-window';
import MarkdownToHtml from 'ember-cli-showdown/components/markdown-to-html';
export default RouteTemplate(
  <template>
    <div class="whats-new">
      <h1>
        What's New in Ember Inspector
      </h1>
      {{#if @controller.error}}
        <p>
          Changelog could not be loaded
        </p>
      {{else}}
        <OpenLinksInNewWindow>
          <MarkdownToHtml @markdown={{@controller.model}} />
        </OpenLinksInNewWindow>
      {{/if}}
    </div>
  </template>,
);
