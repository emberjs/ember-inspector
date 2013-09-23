var TreeNodeControllerView = Ember.View.extend({
  tagName: 'tr',
  classNameBindings: 'isPinned',

  // for testing
  attributeBindings: ['data-label:label'],
  label: 'tree-node',

  isPinned: function() {
    return this.get('node') === this.get('controller.pinnedNode');
  }.property('node', 'controller.pinnedNode'),

  mouseEnter: function(e) {
    this.get('controller').send('previewLayer', this.get('node'));
    e.stopPropagation();
  },

  mouseLeave: function(e) {
    this.get('controller').send('hidePreview', this.get('node'));
    e.stopPropagation();
  }
});

export default TreeNodeControllerView;
