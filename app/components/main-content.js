import Component from '@ember/component';
import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

// Currently used to determine the height of list-views
export default Component.extend({
  /**
   * Layout service. We inject it to keep its `contentHeight` property
   * up-to-date.
   *
   * @property layoutService
   * @type  {Service} layout
   */
  layoutService: service('layout'),

  didInsertElement() {
    this._performUpdateHeight = () => {
      this.get('updateHeightDebounce').perform();
    };

    window.addEventListener('resize', this._performUpdateHeight);
    schedule('afterRender', this, this.updateHeight);
    return this._super(...arguments);
  },

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
    this.get('layoutService').updateContentHeight(this.element.clientHeight);
  },

  willDestroyElement() {
    window.removeEventListener('resize', this._performUpdateHeight);
    return this._super(...arguments);
  }
});
