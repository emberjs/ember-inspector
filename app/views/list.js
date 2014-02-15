import ListItemView from "views/list_item";

export default Ember.ListView.extend({
  classNames: ["list-tree"],

  contentHeight: Ember.computed.alias('controller.controllers.application.contentHeight'),

  filterHeight: 22,

  height: function() {
    var filterHeight = this.get('filterHeight'),
        headerHeight = 30,
        contentHeight = this.get('contentHeight');

    // In testing list-view is created before `contentHeight` is set
    // which will trigger an exception
    if (!contentHeight) {
      return 1;
    }
    return contentHeight - filterHeight - headerHeight;
  }.property('contentHeight'),
  rowHeight: 30,
  itemViewClass: ListItemView
});
