import RouteTemplate from 'ember-route-template';
import ItemTypes from 'ember-inspector/components/item-types';
export default RouteTemplate(
  <template>
    <ItemTypes
      @header="Types"
      @sorted={{readonly @controller.sorted}}
      @type="container"
      @width={{180}}
    >
      {{outlet}}
    </ItemTypes>
  </template>,
);
