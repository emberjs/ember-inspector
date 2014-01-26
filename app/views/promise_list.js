import ListView from "views/list";
import ListItemView from "views/list_item";

var PromiseListView = ListView.extend({
  itemViewClass:  ListItemView.extend({
    templateName: "promise_item"
  })

});

export default PromiseListView;
