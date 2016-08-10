import Ember from 'ember';

const { Component, computed, String: { htmlSafe } } = Ember;

/**
 * Base list view config
 *
 * @module Components
 * @extends Component
 * @class List
 * @namespace Components
 */
export default Component.extend({
  /**
   * @property classNames
   * @type {Array}
   */
  classNames: ["list__content"],

  /**
   * Pass this thought the template.
   * It's the application controller's  `contentHeight`
   * property.
   *
   * @property contentHeight
   * @type {Integer}
   * @default null
   */
  contentHeight: null,

  attributeBindings: ['style'],

  style: computed('height', function() {
    return htmlSafe(`height:${this.get('height')}px`);
  }),

  headerHeight: 31,

  /**
   * @property height
   * @type {Integer}
   */
  height: computed('contentHeight', function() {
    let headerHeight = this.get('headerHeight');
    let contentHeight = this.get('contentHeight');

    // In testing list-view is created before `contentHeight` is set
    // which will trigger an exception
    if (!contentHeight) {
      return 1;
    }
    return contentHeight - headerHeight;
  })
});
