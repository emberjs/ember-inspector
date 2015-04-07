import Ember from 'ember';
import ListView from "ember-inspector/views/list";
import ListItemView from "ember-inspector/views/list-item";

const { computed } = Ember;
const { readOnly } = computed;

export default ListView.extend({
  itemViewClass: ListItemView.extend({
    templateName: "record_item",

    // TODO: Look for a better way
    columns: readOnly('parentView.columns')
  })
});
