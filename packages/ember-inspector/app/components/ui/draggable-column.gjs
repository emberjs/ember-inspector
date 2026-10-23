import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { localCopy } from 'tracked-toolbox';
import ResizableColumn from 'ember-inspector/components/ui/resizable-column';
import DragHandle from 'ember-inspector/components/ui/drag-handle';

/**
 * A column with a handle that the user drags to resize it.
 *
 * - `@width`: the start width, the drag changes a local copy
 * - `@onResize`: called with each new width, to keep it
 *   after the column is destroyed
 */
export default class DraggableColumnComponent extends Component {
  <template>
    <ResizableColumn class={{@classes}} @width={{this.width}}>
      {{yield}}
    </ResizableColumn>

    <DragHandle
      @minWidth={{this.minWidth}}
      @on-drag={{this.triggerResize}}
      @position={{this.width}}
      @side={{@side}}
    />
  </template>
  /**
   * Injected `layout` service. Used to broadcast
   * changes the layout of the app.
   *
   * @property layoutService
   * @type {Service}
   */
  @service('layout') layoutService;

  @tracked minWidth = 60;

  @localCopy('args.width') width;

  /**
   * Trigger that the application dimensions have changed due to
   * something being dragged/resized such as the main nav or the
   * object inspector.
   *
   * @method triggerResize
   */
  @action
  triggerResize(width) {
    this.width = width;
    this.args.onResize?.(width);
    this.layoutService.trigger('resize', { source: 'draggable-column' });
  }
}
