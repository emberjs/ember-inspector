// DraggableColumn
// ===============
// A wrapper for a resizable-column and a drag-handle component
var Component = Ember.Component;

export default Component.extend({
  tagName: '', // Prevent wrapping in a div
  side: 'left',
  minWidth: 60,
  setIsDragging: 'setIsDragging',
  actions: {
    setIsDragging: function(isDragging) {
      this.sendAction('setIsDragging', isDragging);
    }
  }
});
