import Component from '@glimmer/component';
import { action } from '@ember/object';
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
  @tracked minWidth = 60;

  @localCopy('args.width') width;

  /**
   * Called while the handle is dragged.
   *
   * @method triggerResize
   */
  @action
  triggerResize(width) {
    this.width = width;
    this.args.onResize?.(width);
  }
}
