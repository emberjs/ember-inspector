import Ember from 'ember';
import ListView from 'ember-inspector/views/list';
import ListItemView from 'ember-inspector/views/list-item';

const { computed: { readOnly } } = Ember;

/**
 * @module Views
 * @extends Views.List
 * @class RouteList
 * @namespace Views
 */
export default ListView.extend({
  /**
   * @property itemViewClass
   * @type {Ember.View}
   */
  itemViewClass: ListItemView.extend({
    /**
     * @property templateName
     * @type {String}
     * @default 'route_item'
     */
    templateName: 'route_item',

    /**
     * TODO: Need a better way to pass this
     *
     * @property currentRoute
     * @type {String}
     */
    currentRoute: readOnly('parentView.currentRoute')
  })
});
