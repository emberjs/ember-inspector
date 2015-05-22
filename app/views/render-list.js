import Ember from "ember";
const { View } = Ember;
export default View.extend({
  attributeBindings: ['style'],

  classNames: ["list-tree", "list-tree_scrollable"],

  style: function() {
    return 'height:' + this.get('height') + 'px';
  }.property('height'),

  contentHeight: Ember.computed.alias('controller.controllers.application.contentHeight'),

  filterHeight: 22,

  height: function() {
    const filterHeight = this.get('filterHeight'),
        headerHeight = 30,
        contentHeight = this.get('contentHeight');

    // In testing list-view is created before `contentHeight` is set
    // which will trigger an exception
    if (!contentHeight) {
      return 1;
    }
    return contentHeight - filterHeight - headerHeight;
  }.property('contentHeight')
});
