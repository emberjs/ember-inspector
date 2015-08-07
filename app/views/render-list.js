import Ember from "ember";
const { View, computed } = Ember;

export default View.extend({
  attributeBindings: ['style'],

  classNames: ["list-tree", "list-tree_scrollable"],

  style: computed('height', function() {
    return 'height:' + this.get('height') + 'px';
  }),

  contentHeight: Ember.computed.alias('controller.controllers.application.contentHeight'),

  filterHeight: 22,

  height: computed('contentHeight', function() {
    const filterHeight = this.get('filterHeight'),
        headerHeight = 30,
        contentHeight = this.get('contentHeight');

    // In testing list-view is created before `contentHeight` is set
    // which will trigger an exception
    if (!contentHeight) {
      return 1;
    }
    return contentHeight - filterHeight - headerHeight;
  })
});
