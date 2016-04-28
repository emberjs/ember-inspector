import Ember from 'ember';
import ListView from 'ember-inspector/views/list';
import ListItemView from 'ember-inspector/views/list-item';

const { computed: { readOnly } } = Ember;

/**
 * @module Views
 * @extends Views.List
 * @class ViewList
 * @namespace Views
 */
export default ListView.extend({
  /**
   * @property itemViewClass
   * @type {Ember.View}
   */
  itemViewClass: ListItemView.extend({
    /**
     * @property classNames
     * @type {Array}
     */
    classNames: ['js-tree-node'],

    /**
     * @property templateName
     * @type {String}
     * @default 'view_item'
     */
    templateName: 'view_item',

    /**
     * TODO: Need a better way to pass this
     *
     * @property pinnedObjectId
     * @type {Integer}
     */
    pinnedObjectId: readOnly('parentView.pinnedObjectId'),

    /**
     * @property node
     * @type {Ember.Controller}
     */
    node: readOnly('context'),

    /**
     * @method mouseEnter
     * @param {Object} e event object
     */
    mouseEnter(e) {
      this.get('controller').send('previewLayer', this.get('node'));
      e.stopPropagation();
    },

    /**
     * @method mouseLeave
     * @param {Object} e event object
     */
    mouseLeave(e) {
      this.get('controller').send('hidePreview', this.get('node'));
      e.stopPropagation();
    }
  })
});
