var ApplicationView = Ember.View.extend({
  classNames: ['app'],

  classNameBindings: ['inactive:app_state_inactive', 'controller.inspectorExpanded:app_inspector_expanded'],

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
  }
});

export default ApplicationView;
