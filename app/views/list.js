import Ember from 'ember';
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
export default Ember.View.extend({
  templateName: "list",

  /**
   * @property classNames
   * @type {Array}
   */
  classNames: ["list-tree", "ember-list-view"],

  /**
   * @property contentHeight
   * @type {Integer}
   */
  contentHeight: alias('controller.application.contentHeight'),

  attributeBindings: ['style'],

  style: computed('height', function() {
    return Ember.String.htmlSafe(`height:${this.get('height')}px`);
  }),

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

  itemViewClass: ListItemView
});
