import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class DraggableColumnComponent extends Component {
  /**
   * Injected `layout` service. Used to broadcast
   * changes the layout of the app.
   *
   * @property layoutService
   * @type {Service}
   */
  @service('layout') layoutService;

  @tracked minWidth = 60;

  /**
   * Trigger that the application dimensions have changed due to
   * something being dragged/resized such as the main nav or the
   * object inspector.
   *
   * @method triggerResize
   */
  @action
  triggerResize() {
    this.layoutService.trigger('resize', { source: 'draggable-column' });
  }
}
