import ListItemView from "views/list_item";

var ListView = Ember.ListView.extend({
  classNames: ["list-tree"],

  appHeight: Ember.computed.alias('controller.controllers.application.height'),

  height: function() {
    var filterHeight = 22,
        headerHeight = 30,
        appHeight = this.get('appHeight');

    // In testing list-view is created before `appHeight` is set
    // which will trigger an exception
    if (!appHeight) {
      return 1;
    }
    return appHeight - filterHeight - headerHeight;
  }.property('appHeight'),
  rowHeight: 30,
  itemViewClass: ListItemView
});

export default ListView;
