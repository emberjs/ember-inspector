import ListView from "views/list";
import ListItemView from "views/list_item";

var RecordListView = ListView.extend({
  itemViewClass:  ListItemView.extend({
    templateName: "record_item"
  })

});

export default RecordListView;
