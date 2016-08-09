import Ember from "ember";
const { computed, String: { htmlSafe } } = Ember;
export default Ember.Component.extend({
  classNames: ['drag-handle'],
  classNameBindings: ['isLeft:drag-handle--left', 'isRight:drag-handle--right', 'class'],
  attributeBindings: ['style'],
  position: 0,
  side: '',
  isRight: Ember.computed.equal('side', 'right'),
  isLeft: Ember.computed.equal('side', 'left'),
  minWidth: 60,

  startDragging() {
    let $container = this.$().parent();
    let $containerOffsetLeft = $container.offset().left;
    let $containerOffsetRight = $containerOffsetLeft + $container.width();
    let namespace = `drag-${this.get('elementId')}`;

    this.sendAction('action', true);

    Ember.$('body').on(`mousemove.${namespace}`, e => {
      let position = this.get('isLeft') ?
                       e.pageX - $containerOffsetLeft :
                       $containerOffsetRight - e.pageX;

      if (position >= this.get('minWidth')) {
        this.set('position', position);
      }
    })
    .on(`mouseup.${namespace} mouseleave.${namespace}`, () => {
      this.stopDragging();
    });
  },

  stopDragging() {
    this.sendAction('action', false);
    Ember.$('body').off(`.drag-${this.get('elementId')}`);
  },

  willDestroyElement() {
    this._super();
    this.stopDragging();
  },

  mouseDown() {
    this.startDragging();
    return false;
  },

  style: computed('side', 'position', function () {
    let string;
    if (this.get('side')) {
      string = `${this.get('side')}: ${this.get('position')}px;`;
    } else {
      string = '';
    }
    return htmlSafe(string);
  })
});
