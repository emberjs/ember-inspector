import Ember from 'ember';
import ListView from "ember-inspector/views/list";
import ListItemView from "ember-inspector/views/list-item";
const { computed } = Ember;
const { readOnly } = computed;

export default ListView.extend({
  itemViewClass:  ListItemView.extend({
    templateName: "route_item",

    // TODO: Need a better way to pass this
    currentRoute: readOnly('parentView.currentRoute')
  })
});
