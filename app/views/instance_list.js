import ListView from "views/list";
import ListItemView from "views/list_item";

export default ListView.extend({
  itemViewClass:  ListItemView.extend({
    templateName: "instance_item"
  })

});
