import { action } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from '../templates/components/draggable-column';

export default Component.extend({
  layout,
  tagName: '',
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
  triggerResize: action(function() {
    this.layoutService.trigger('resize', { source: 'draggable-column' });
  }),
});
