var TreeNodeControllerView = Ember.View.extend({
  tagName: 'span',
  classNames: 'controller',
  classNameBindings: 'isPinned',

  isPinned: function() {
    return this.get('node') === this.get('controller.pinnedNode');
  }.property('node', 'controller.pinnedNode'),

  mouseEnter: function() {
    this.get('controller').send('showLayer', this.get('node'));
  },

  mouseLeave: function() {
    this.get('controller').send('hideLayer', this.get('node'));
  },

  click: function() {
    this.get('controller').pinLayer(this.get('node'));
  }
});

export = TreeNodeControllerView;
