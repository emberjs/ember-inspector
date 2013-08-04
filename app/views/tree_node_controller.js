var TreeNodeControllerView = Ember.View.extend({
  tagName: 'span',
  classNames: [ 'view-tree__node-controller', 'tree__node-controller'],
  classNameBindings: 'isPinned',

  isPinned: function() {
    return this.get('node') === this.get('controller.pinnedNode');
  }.property('node', 'controller.pinnedNode'),

  mouseEnter: function() {
    this.get('controller').send('previewLayer', this.get('node'));
  },

  mouseLeave: function() {
    this.get('controller').send('hidePreview', this.get('node'));
  },

  click: function() {
    this.get('controller').send('showLayer', this.get('node'));
  }
});

export defaultTreeNodeControllerView;
