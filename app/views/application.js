var ApplicationView = Ember.View.extend({
  classNames: ['app'],

  classNameBindings: [
    'inactive:app_state_inactive',
    'controller.inspectorExpanded:app_inspector_expanded',
    'controller.isDragging:app_state_dragging'
  ],

  inactive: Ember.computed.not('controller.active'),

  attributeBindings: ['tabindex'],
  tabindex: 1,

  focusIn: function() {
    if (!this.get('controller.active')) {
      this.set('controller.active', true);
    }
  },

  focusOut: function() {
    if (this.get('controller.active')) {
      this.set('controller.active', false);
    }
  },

  inspectorStyle: function() {
    if (this.get('controller.inspectorExpanded')) {
      return 'width: ' + this.get('controller.inspectorWidth') + 'px;';
    } else {
      return '';
    }
  }.property('controller.inspectorWidth', 'controller.inspectorExpanded')
});

export default ApplicationView;
