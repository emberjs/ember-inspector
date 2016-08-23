import Ember from 'ember';

const { Component, computed, String: { htmlSafe }, Evented, $, run, Object: EmberObject } = Ember;
const { schedule } = run;

/**
 * Base list view config
 *
 * @module Components
 * @extends Component
 * @class List
 * @namespace Components
 */
export default Component.extend(Evented, {
  /**
   * @property classNames
   * @type {Array}
   */
  classNames: ["list__content", "js-list-content"],

  /**
   * Hook called when content element is inserted.
   * Used to setup event listeners to work-around
   * smoke-and-mirrors lack of events.
   *
   * @method didInsertElement
   */
  didInsertElement() {
    schedule('afterRender', this, this.setupEvents);
  },

  /**
   * Set up event listening on the individual rows in the table.
   * Rows can listen to these events by listening to events on the `rowEvents`
   * property.
   *
   * @method setupEvents
   */
  setupEvents() {
    this.set('rowEvents', EmberObject.extend(Evented).create());
    this.$().on('click mouseleave mouseenter', 'tr', run.bind(this, 'triggerRowEvent'));
  },

  /**
   * Broadcasts that an event was triggered on a row.
   *
   * @method triggerRowEvent
   * @param {Object}
   *  - {String} type The event type to trigger
   *  - {DOMElement} currentTarget The element the event was triggered on
   */
  triggerRowEvent({ type, currentTarget }) {
    this.get('rowEvents').trigger(type, { index: $(currentTarget).index(), type });
  },

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


  /**
   * Array of objects representing the columns to render
   * and their corresponding widths. This array is passed
   * through the template.
   *
   * Each item in the array has `width` and `id` properties.
   *
   * @property columns
   * @type {Array}
   */
  columns: computed(() => []),

  /**
   * Number passed from `x-list`. Indicates the header height
   * in pixels.
   *
   * @property headerHeight
   * @type {Number}
   */
  headerHeight: null,

  /**
   * @property height
   * @type {Integer}
   */
  height: computed('contentHeight', 'headerHeight', function() {
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
