import $ from 'jquery';
import { equal } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  classNames: ['drag-handle'],
  classNameBindings: ['isLeft:drag-handle--left', 'isRight:drag-handle--right', 'faded:drag-handle--faded'],
  attributeBindings: ['style'],
  position: 0,
  side: '',
  isRight: equal('side', 'right'),
  isLeft: equal('side', 'left'),
  minWidth: 60,

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
    let $container = this.$().parent();
    let $containerOffsetLeft = $container.offset().left;
    let $containerOffsetRight = $containerOffsetLeft + $container.width();
    let namespace = `drag-${this.get('elementId')}`;

    this.sendAction('action', true);

    $('body').on(`mousemove.${namespace}`, e => {
      let position = this.get('isLeft') ?
        e.pageX - $containerOffsetLeft :
        $containerOffsetRight - e.pageX;

      position -= this.get('left');
      if (position >= this.get('minWidth') && position <= this.get('maxWidth')) {
        this.set('position', position);
        this.get('on-drag')(position);
      }
    })
      .on(`mouseup.${namespace} mouseleave.${namespace}`, () => {
        this.stopDragging();
      });
  },

  stopDragging() {
    this.sendAction('action', false);
    $('body').off(`.drag-${this.get('elementId')}`);
  },

  willDestroyElement() {
    this._super();
    this.stopDragging();
  },

  mouseDown() {
    this.startDragging();
    return false;
  },

  style: computed('side', 'position', 'left', function() {
    let string;
    if (this.get('side')) {
      string = `${this.get('side')}: ${(this.get('position') + this.get('left'))}px;`;
    } else {
      string = '';
    }
    return htmlSafe(string);
  })
});
