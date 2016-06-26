import Ember from 'ember';

const { computed } = Ember;

export default Ember.Component.extend({
  /**
   * @property classNames
   * @type {Array}
   */
  classNames: ["list-tree", "ember-list-view"],

  /**
   * @property contentHeight
   * @type {Integer}
   */
  // contentHeight: alias('controller.application.contentHeight'),
  contentHeight: 27, // TODO: fix with service or something

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

});
