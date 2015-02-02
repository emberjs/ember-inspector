import Ember from "ember";
import ListView from "ember-inspector/views/list";
import ListItemView from "ember-inspector/views/list-item";

const { computed } = Ember;
const { readOnly } = computed;

export default ListView.extend({
  itemViewClass: ListItemView.extend({
    templateName: "view_item",

    // TODO: Find a better way
    pinnedObjectId: readOnly('parentView.pinnedObjectId'),

    node: readOnly('context'),
    // for testing
    attributeBindings: ['data-label:label'],
    label: 'tree-node',

    mouseEnter(e) {
      this.get('controller').send('previewLayer', this.get('node'));
      e.stopPropagation();
    },

    mouseLeave(e) {
      this.get('controller').send('hidePreview', this.get('node'));
      e.stopPropagation();
    }
  })
});
