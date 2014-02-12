import ListView from "views/list";
import ListItemView from "views/list_item";

var RouteListView = ListView.extend({
  itemViewClass:  ListItemView.extend({
    templateName: "route_item"
  }),
  filterHeight: 0

});

export default RouteListView;
