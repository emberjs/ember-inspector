export default Ember.Component.extend({
  classNames: ['drag-handle'],
  isDragging: false,
  positionLeft: null,
  positionRight: null,

  startDragging: function() {
    var self = this,
        body = Ember.$('body'),
        namespace = 'drag-' + this.get('elementId');

    this.set('isDragging', true);
    body.on('mousemove.' + namespace, function(e){
      self.setProperties({
        positionRight: body.width() - e.pageX,
        positionLeft: e.pageX
      });
    })
    .on('mouseup.' + namespace + ' mouseleave.' + namespace, function(){
      self.stopDragging();
    });
  },

  stopDragging: function() {
    this.set('isDragging', false);
    Ember.$('body').off('.drag-' + this.get('elementId'));
  },

  willDestroyElement: function() {
    this._super();
    this.stopDragging();
  },

  mouseDown: function() {
    this.startDragging();
    return false;
  }
});
