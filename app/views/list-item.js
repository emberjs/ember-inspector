import ListItemView from 'ember-list-view/list-item-view';

/**
 * @module Views
 * @extends ListItemView
 * @class ListItem
 * @namespace Views
 */
export default ListItemView.extend({
  /**
   * @property classNames
   * @type {Array}
   */
  classNames: ["list-tree__item-wrapper", "row-wrapper"]
});
