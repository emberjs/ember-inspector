import RouteTemplate from 'ember-route-template';
import ModelTypesToolbar from 'ember-inspector/components/model-types-toolbar';
import ItemTypes from 'ember-inspector/components/item-types';
export default RouteTemplate(
  <template>
    {{#if @controller.toolbarContainer}}
      {{#in-element @controller.toolbarContainer}}
        <ModelTypesToolbar
          @getStore={{@controller.getStore}}
          @hideEmptyModelTypes={{@controller.hideEmptyModelTypes}}
          @orderByRecordCount={{@controller.orderByRecordCount}}
          @reload={{@controller.refresh}}
        />
      {{/in-element}}
    {{/if}}

    <ItemTypes
      @header="Model Types"
      @sorted={{readonly
        (if
          @controller.orderByRecordCount
          @controller.sortByDescCount
          @controller.sortByName
        )
      }}
      @type="model"
      @width={{@controller.navWidth}}
    >
      {{outlet}}
    </ItemTypes>
  </template>,
);
