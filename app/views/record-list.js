import Ember from 'ember';
import ListView from 'ember-inspector/views/list';
import ListItemView from 'ember-inspector/views/list-item';

const { computed: { readOnly } } = Ember;

/**
 * @module Views
 * @extends Views.List
 * @class RecordList
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
     * @default 'record_item'
     */
    templateName: 'record_item',

    /**
     * TODO: Need a better way to pass this
     *
     * @property columns
     * @type {Array}
     */
    columns: readOnly('parentView.columns')
  })
});
