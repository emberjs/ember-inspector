import Component from '@ember/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

// Currently used to determine the height of list-views
export default Component.extend({
  tagName: '',

  /**
   * Layout service. We inject it to keep its `contentHeight` property
   * up-to-date.
   *
   * @property layoutService
   * @type  {Service} layout
   */
  layoutService: service('layout'),

  /**
   * Reference to drag-handle on mousedown
   *
   * @property el
   * @type {DOMNode|null}
   * @default null
   */
  el: null,

  setupListeners: action(function(element) {
    this.el = element;

    this._performUpdateHeight = () => {
      this.updateHeightDebounce.perform();
    };

    window.addEventListener('resize', this._performUpdateHeight);
    this.updateHeight();
  }),

  destroyListeners: action(function() {
    window.removeEventListener('resize', this._performUpdateHeight);
  }),

  /**
   * Restartable Ember Concurrency task that triggers
   * `updateHeight` after 100ms.
   *
   * @property updateHeightDebounce
   * @type {Object} Ember Concurrency task
   */
  updateHeightDebounce: task(function * () {
    yield timeout(100);
    this.updateHeight();
  }).restartable(),

  /**
   * Update the layout's `contentHeight` property.
   * This will cause the layout service to trigger
   * the `content-height-update` event which will update
   * list heights.
   *
   * This is called initially when this component is inserted
   * and whenever the window is resized.
   *
   * @method updateHeight
   */
  updateHeight() {
    this.layoutService.updateContentHeight(this.el.clientHeight);
  },
});
