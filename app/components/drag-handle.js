import Ember from "ember";

export default Ember.Component.extend({
  classNames: ['drag-handle'],
  classNameBindings: ['isLeft:drag-handle--left', 'isRight:drag-handle--right'],
  attributeBindings: ['style'],
  position: 0,
  side: '',
  isRight: Ember.computed.equal('side', 'right'),
  isLeft: Ember.computed.equal('side', 'left'),
  minWidth: 60,

  startDragging: function() {
    var self = this,
        $container = this.$().parent(),
        $containerOffsetLeft = $container.offset().left,
        $containerOffsetRight = $containerOffsetLeft + $container.width(),
        namespace = 'drag-' + this.get('elementId');

    this.sendAction('action', true);

    Ember.$('body').on('mousemove.' + namespace, function(e){
      var position = self.get('isLeft') ?
                       e.pageX - $containerOffsetLeft :
                       $containerOffsetRight - e.pageX;

      if (position >= self.get('minWidth')) {
        self.set('position', position);
      }
    })
    .on('mouseup.' + namespace + ' mouseleave.' + namespace, function(){
      self.stopDragging();
    });
  },

  stopDragging: function() {
    this.sendAction('action', false);
    Ember.$('body').off('.drag-' + this.get('elementId'));
  },

  willDestroyElement: function() {
    this._super();
    this.stopDragging();
  },

  mouseDown: function() {
    this.startDragging();
    return false;
  },

  style: function () {
    if (this.get('side')) {
      return this.get('side') + ':' + this.get('position') + 'px';
    }
    else {
      return '';
    }
  }.property('side', 'position')
});
