import Ember from 'ember';
import ListView from 'ember-list-view';
import ListItemView from 'ember-inspector/views/list-item';

const { computed, computed: { alias } } = Ember;

/**
 * Base list view config
 *
 * @module Views
 * @extends ListView
 * @class List
 * @namespace Views
 */
export default ListView.extend({
  /**
   * @property classNames
   * @type {Array}
   */
  classNames: ["list-tree"],

  /**
   * @property contentHeight
   * @type {Integer}
   */
  contentHeight: alias('controller.controllers.application.contentHeight'),

  /**
   * @property height
   * @type {Integer}
   */
  height: computed('contentHeight', function() {
    let headerHeight = 31;
    let contentHeight = this.get('contentHeight');

    // In testing list-view is created before `contentHeight` is set
    // which will trigger an exception
    if (!contentHeight) {
      return 1;
    }
    return contentHeight - headerHeight;
  }),

  /**
   * @property rowHeight
   * @type {Integer}
   * @default 30
   */
  rowHeight: 30,

  /**
   * @property itemViewClass
   * @type {Ember.View}
   */
  itemViewClass: ListItemView
});
