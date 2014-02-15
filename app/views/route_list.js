import ListView from "views/list";
import ListItemView from "views/list_item";

export default ListView.extend({
  itemViewClass:  ListItemView.extend({
    templateName: "route_item"
  }),
  filterHeight: 0

});
