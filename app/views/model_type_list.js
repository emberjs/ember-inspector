import ListView from "views/list";
import ListItemView from "views/list_item";

export default ListView.extend({
  itemViewClass:  ListItemView.extend({
    templateName: "model_type_item"
  }),
  filterHeight: 0

});
