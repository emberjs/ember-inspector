import Component from '@glimmer/component';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { localCopy } from 'tracked-toolbox';

/**
 * A handle that the user drags to resize a column.
 *
 * - `@side`: `left` or `right`
 * - `@position`: the start position, the drag changes a local copy
 * - `@left`: the left offset to add to the position
 * - `@minWidth` and `@maxWidth`: the range of the position
 * - `@faded`: fade the handle
 * - `@on-drag`: called with each new position
 */
export default class DragHandle extends Component {
  @localCopy('args.position', 0) position;

  /**
   * Reference to the drag handle on mousedown
   */
  el = null;

  get side() {
    return this.args.side ?? '';
  }

  get isLeft() {
    return this.side === 'left';
  }

  get isRight() {
    return this.side === 'right';
  }

  get left() {
    return this.args.left ?? 0;
  }

  get minWidth() {
    return this.args.minWidth ?? 60;
  }

  get maxWidth() {
    return this.args.maxWidth ?? Infinity;
  }

  get style() {
    return htmlSafe(
      this.side ? `${this.side}: ${this.position + this.left}px;` : '',
    );
  }

  startDragging() {
    document.body.addEventListener(`mousemove`, this.mouseMoveHandler);
    document.body.addEventListener(`mouseup`, this.stopDragging);
    document.body.addEventListener(`mouseleave`, this.stopDragging);
  }

  @action
  stopDragging() {
    document.body.removeEventListener(`mousemove`, this.mouseMoveHandler);
    document.body.removeEventListener(`mouseup`, this.stopDragging);
    document.body.removeEventListener(`mouseleave`, this.stopDragging);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.stopDragging();
  }

  @action
  mouseDownHandler(e) {
    e.preventDefault();
    this.el = e.target;
    this.startDragging();
  }

  @action
  mouseMoveHandler(e) {
    let container = this.el.parentNode;
    let containerOffsetLeft = getOffsetLeft(container);
    let containerOffsetRight = containerOffsetLeft + container.offsetWidth;

    let position = this.isLeft
      ? e.pageX - containerOffsetLeft
      : containerOffsetRight - e.pageX;

    position -= this.left;
    if (position >= this.minWidth && position <= this.maxWidth) {
      this.position = position;
      this.args['on-drag']?.(position);
    }
  }
}

function getOffsetLeft(elem) {
  let offsetLeft = 0;
  do {
    if (!isNaN(elem.offsetLeft)) {
      offsetLeft += elem.offsetLeft;
    }
    elem = elem.offsetParent;
  } while (elem.offsetParent);
  return offsetLeft;
}
