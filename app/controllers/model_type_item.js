var ModelTypeItemController = Ember.ObjectController.extend({
  needs: ['model_types'],

  selected: function() {
    return this.get('model') === this.get('controllers.model_types.selected');
  }.property('controllers.model_types.selected'),

  collapsed: Ember.computed.alias('controllers.model_types.collapsed')

});

export default ModelTypeItemController;
