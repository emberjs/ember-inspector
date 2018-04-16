// DraggableColumn
// ===============
// A wrapper for a resizable-column and a drag-handle component

import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  tagName: '', // Prevent wrapping in a div
  side: 'left',
  minWidth: 60,

  /**
   * Injected `layout` service. Used to broadcast
   * changes the layout of the app.
   *
   * @property layoutService
   * @type {Service}
   */
  layoutService: service('layout'),

  /**
   * Trigger that the application dimensions have changed due to
   * something being dragged/resized such as the main nav or the
   * object inspector.
   *
   * @method triggerResize
   */
  triggerResize() {
    this.get('layoutService').trigger('resize', { source: 'draggable-column' });
  },

  actions: {
    /**
     * Action called whenever the draggable column has been
     * resized.
     *
     * @method didDrag
     */
    didDrag() {
      this.triggerResize();
    }
  }
});
