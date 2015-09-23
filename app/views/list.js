import Ember from "ember";
import ListItemView from "ember-inspector/views/list-item";
import ListView from "list-view/list-view";
const { computed } = Ember;

export default ListView.extend({
  classNames: ["list-tree"],

  contentHeight: Ember.computed.alias('controller.controllers.application.contentHeight'),

  height: computed('contentHeight', function() {
    let headerHeight = 31;
    let contentHeight = this.get('contentHeight');

    // In testing list-view is created before `contentHeight` is set
    // which will trigger an exception
    if (!contentHeight) {
      return 1;
    }
    return contentHeight - headerHeight;
  }),
  rowHeight: 30,
  itemViewClass: ListItemView
});
