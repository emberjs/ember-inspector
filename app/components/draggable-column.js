// DraggableColumn
// ===============
// A wrapper for a resizable-column and a drag-handle component

import Ember from "ember";
const { Component, computed } = Ember;

export default Component.extend({
  tagName: '', // Prevent wrapping in a div
  side: 'left',
  minWidth: 60,
  setIsDragging: 'setIsDragging',
  classes: computed('classNames.[]', function() {
    return this.get('classNames').join(' ');
  }),
  actions: {
    setIsDragging: function(isDragging) {
      this.sendAction('setIsDragging', isDragging);
    }
  }
});
