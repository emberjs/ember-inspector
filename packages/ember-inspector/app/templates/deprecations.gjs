import RouteTemplate from 'ember-route-template';
import DeprecationsToolbar from 'ember-inspector/components/deprecations-toolbar';
import VerticalCollection from '@html-next/vertical-collection/components/vertical-collection/component';
import DeprecationItem from 'ember-inspector/components/deprecation-item';
import EmptyMessage from 'ember-inspector/components/ui/empty-message';
import { on } from '@ember/modifier';
export default RouteTemplate(
  <template>
    {{#if @controller.toolbarContainer}}
      {{#in-element @controller.toolbarContainer}}
        <DeprecationsToolbar
          @changeDeprecationWorkflow={{@controller.changeDeprecationWorkflow}}
          @clear={{@controller.clear}}
          @searchValue={{@controller.searchValue}}
          @toggleDeprecationWorkflow={{@controller.toggleDeprecationWorkflow}}
        />
      {{/in-element}}
    {{/if}}

    {{#if @controller.filtered.length}}
      <div class="list-content js-deprecations">
        <VerticalCollection
          @items={{@controller.filtered}}
          @estimateHeight={{20}}
          as |content|
        >
          <DeprecationItem
            @model={{content}}
            @openResource={{@controller.openResource}}
            @traceSource={{@controller.traceSource}}
            @traceDeprecations={{@controller.traceDeprecations}}
          />
        </VerticalCollection>
      </div>
    {{else}}
      <EmptyMessage class="js-page-refresh">
        <p>
          No deprecations have been detected. Try reloading to catch the
          deprecations that were logged before you opened the inspector.
        </p>
        <button
          class="js-page-refresh-btn"
          type="button"
          {{on "click" @controller.adapter.refreshPage}}
        >
          Reload
        </button>
      </EmptyMessage>
    {{/if}}
  </template>,
);
