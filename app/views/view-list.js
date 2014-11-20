import Ember from "ember";
import ListView from "ember-inspector/views/list";
import ListItemView from "ember-inspector/views/list-item";

export default ListView.extend({
  itemViewClass: ListItemView.extend({
    templateName: "view_item",
    classNameBindings: 'isPinned',
    node: Ember.computed.alias('controller.model'),
    // for testing
    attributeBindings: ['data-label:label'],
    label: 'tree-node',

    isPinned: function() {
      return this.get('node') === this.get('controller.pinnedNode');
    }.property('node', 'controller.pinnedNode'),

    mouseEnter: function(e) {
      this.get('controller').send('previewLayer', this.get('node'));
      e.stopPropagation();
    },

    mouseLeave: function(e) {
      this.get('controller').send('hidePreview', this.get('node'));
      e.stopPropagation();
    }
  })
});
