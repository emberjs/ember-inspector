// DraggableColumn
// ===============
// A wrapper for a resizable-column and a drag-handle component

import Ember from "ember";
var Component = Ember.Component;

export default Component.extend({
  tagName: '', // Prevent wrapping in a div
  side: 'left',
  minWidth: 60,
  setIsDragging: 'setIsDragging',
  classes: function() {
    return this.get('classNames').join(' ');
  }.property('classNames.[]'),
  actions: {
    setIsDragging: function(isDragging) {
      this.sendAction('setIsDragging', isDragging);
    }
  }
});
