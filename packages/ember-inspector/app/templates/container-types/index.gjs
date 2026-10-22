import RouteTemplate from 'ember-route-template';
import ContainerTypesToolbar from 'ember-inspector/components/container-types-toolbar';
export default RouteTemplate(
  <template>
    {{#if @controller.toolbarContainer}}
      {{#in-element @controller.toolbarContainer}}
        <ContainerTypesToolbar
          @reload={{@controller.refresh}}
          @sendContainerToConsole={{@controller.sendContainerToConsole}}
        />
      {{/in-element}}
    {{/if}}

    {{yield}}
  </template>,
);
