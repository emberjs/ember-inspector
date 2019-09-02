import Component from '@ember/component';
import { not } from '@ember/object/computed';
export default Component.extend({
  classNames: ['app'],

  classNameBindings: [
    'inactive',
    'isDragging'
  ],

  attributeBindings: ['tabindex'],
  tabindex: 1,

  isDragging: false,

  /**
   * Bound to application controller.
   *
   * @property active
   * @type {Boolean}
   * @default false
   */
  active: false,

  inactive: not('active'),

  focusIn() {
    if (!this.active) {
      this.set('active', true);
    }
  },

  focusOut() {
    if (this.active) {
      this.set('active', false);
    }
  }
});
