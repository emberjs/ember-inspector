import { equal } from '@ember/object/computed';
import Component from '@ember/component';
import { action, computed } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default Component.extend({
  tagName: '',
  position: 0,
  side: '',
  isRight: equal('side', 'right'),
  isLeft: equal('side', 'left'),
  minWidth: 60,

  /**
   * Reference to drag-handle on mousedown
   *
   * @property el
   * @type {DOMNode|null}
   * @default null
   */
  el: null,

  /**
   * The maximum width this handle can be dragged to.
   *
   * @property maxWidth
   * @type {Number}
   * @default Infinity
   */
  maxWidth: Infinity,

  /**
   * The left offset to add to the initial position.
   *
   * @property left
   * @type {Number}
   * @default 0
   */
  left: 0,

  /**
   * Modifier added to the class to fade the drag handle.
   *
   * @property faded
   * @type {Boolean}
   * @default false
   */
  faded: false,

  /**
   * Action to trigger whenever the drag handle is moved.
   * Pass this action through the template.
   *
   * @property on-drag
   * @type {Function}
   */
  'on-drag'() {},

  startDragging() {
    this._mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this._stopDragging = this.stopDragging.bind(this);
    document.body.addEventListener(`mousemove`, this._mouseMoveHandler);
    document.body.addEventListener(`mouseup`, this._stopDragging);
    document.body.addEventListener(`mouseleave`, this._stopDragging);
  },

  stopDragging() {
    document.body.removeEventListener(`mousemove`, this._mouseMoveHandler);
    document.body.removeEventListener(`mouseup`, this._stopDragging);
    document.body.removeEventListener(`mouseleave`, this._stopDragging);
  },

  willDestroy() {
    this._super();
    this.stopDragging();
  },

  mouseDownHandler: action(function (e) {
    e.preventDefault();
    this.el = e.target;
    this.startDragging();
  }),

  style: computed('side', 'position', 'left', function () {
    return htmlSafe(
      this.side ? `${this.side}: ${this.position + this.left}px;` : '',
    );
  }),

  mouseMoveHandler(e) {
    let container = this.el.parentNode;
    let containerOffsetLeft = getOffsetLeft(container);
    let containerOffsetRight = containerOffsetLeft + container.offsetWidth;

    let position = this.isLeft
      ? e.pageX - containerOffsetLeft
      : containerOffsetRight - e.pageX;

    position -= this.left;
    if (position >= this.minWidth && position <= this.maxWidth) {
      this.set('position', position);
      this['on-drag'](position);
    }
  },
});

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
