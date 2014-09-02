export default Ember.View.extend({
  classNames: ['app'],

  classNameBindings: [
    'inactive',
    'controller.isDragging'
  ],

  inactive: Ember.computed.not('controller.active'),

  attributeBindings: ['tabindex'],
  tabindex: 1,

  height: Ember.computed.alias('controller.height'),

  didInsertElement: function() {
    this._super();

    Ember.$(window).on('resize.application-view-' + this.get('elementId'), function() {
      Ember.run.debounce(this, 'updateHeight', 200);
    }.bind(this));
    this.updateHeight();
  },

  updateHeight: function() {
    // could be destroyed but with debounce pending
    if (this.$()) {
      this.set('height', this.$().height());
    }
  },

  willDestroyElement: function() {
    Ember.$(window).off('.application-view-' + this.get('elementId'));
  },

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
