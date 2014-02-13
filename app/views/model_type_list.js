import ListView from "views/list";
import ListItemView from "views/list_item";

var ModelTypeList = ListView.extend({
  itemViewClass:  ListItemView.extend({
    templateName: "model_type_item"
  }),
  filterHeight: 0

});

export default ModelTypeList;
